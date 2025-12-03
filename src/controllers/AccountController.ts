import {Response} from "express";
import {UpdateUserDTO, UserDto} from "../model/user.js";
import {accountServiceMongo} from "../service/AccountServiceImpMongo.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {convertUserDTOToUser, excessLevels} from "../utils/tools.js";
import {loggerWinston} from "../winston/logger.js";
import {AuthRequest, Role} from "../utils/libTypes.js";

class AccountController {
    service = accountServiceMongo;

    setRoles = async (req: AuthRequest, res: Response) => {
        const newRoles: Role[] =  req.body.roles;
        const userId = +req.query.userId!;
        const user = await this.service.getAccountById(userId);
        if (Math.max(...excessLevels(req.roles!)) <= Math.max(...excessLevels(newRoles)))
            throw new HttpError(401, 'unauthorized', '@setRoles');
        const userResult = await this.service.setAccountRole(userId, newRoles);
        res.status(200).json(userResult);
        loggerWinston.info(`userId: ${req.userId}@roles of account with id ${userResult._id} are updated@setRoles`)
    }

    createAccount = async (req: AuthRequest, res: Response) => {
        const body = req.body as UserDto;
        const user = convertUserDTOToUser(body);
        await this.service.createAccount(user);
        res.status(201).send();
        loggerWinston.info(`userId: ${req.userId}@account with id ${user._id} is created@createAccount`)
    };

    getAccountById = async (req: AuthRequest, res: Response) => {
        const userId = +req.query.userId!;
        if (!userId) throw new HttpError(400, 'no params', '@getAccountById');
        const user = await this.service.getAccountById(userId);
        if (req.userId !== userId) {
            if (Math.max(...excessLevels(req.roles!)) < Math.max(...excessLevels(user.roles!)) || Math.max(...excessLevels(req.roles!)) === 1)
                throw new HttpError(401, 'unauthorized', '@getAccountById');
        }
        const userResult = await this.service.getAccount(userId, '@getAccountById');
        res.json(userResult);
        loggerWinston.info(`userId: ${req.userId}@account with id ${userResult._id} is responsed@getAccountById`)
    };

    removeAccount = async (req: AuthRequest, res: Response) => {
        const userId = +req.query.userId!;
        if (!userId) throw new HttpError(400, 'no params', '@removeAccount');
        const user = await this.service.getAccountById(userId);
        if (Math.max(...excessLevels(req.roles!)) <= Math.max(...excessLevels(user.roles!)))
            throw new HttpError(401, 'unauthorized', '@getAccountById');
        const userRemove = await this.service.removeAccount(userId);
        res.json(userRemove);
        loggerWinston.info(`userId: ${req.userId}@account with id ${userRemove._id} is removed@removeAccount`)
    };

    changePassword = async (req: AuthRequest, res: Response) => {
        const {oldPassword, newPassword} = req.body;
        if(oldPassword === newPassword)
            throw new HttpError(409, 'old and new password must be different', '@changePassword');
        const userId = +req.userId!;
        await this.service.changePassword(userId, oldPassword, newPassword);
        res.status(200).send();
        loggerWinston.info(`userId: ${req.userId}@password of account with id ${userId} is changed@changePassword`)
    };

    editAccount = async (req: AuthRequest, res: Response) => {
        const userId = +req.query.userId!;
        const newUserData = req.body as UpdateUserDTO;
        const user = await this.service.getAccountById(userId);
        if (req.userId !== userId) {
            if (Math.max(...excessLevels(req.roles!)) <= Math.max(...excessLevels(user.roles!)) || Math.max(...excessLevels(req.roles!)) < 3)
                throw new HttpError(401, 'unauthorized', '@editAccount');
        }
        const userResult = await this.service.editAccount(userId, newUserData);
        res.json(userResult);
        loggerWinston.info(`userId: ${req.userId}@info of account with id ${userId} is updated@changePassword`)
    };

}

export const accountController = new AccountController();