import {Request, Response} from "express";
import {UserDto, UpdateUserDTO} from "../model/user.js";
import {accountServiceMongo} from "../service/AccountServiceImpMongo.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {convertUserDTOToUser} from "../utils/tools.js";
import {loggerWinston} from "../winston/logger.js";
import {AuthRequest, Role} from "../utils/libTypes.js";

class AccountController {
    service = accountServiceMongo;

    createAccount = async (req: AuthRequest, res: Response) => {
        const body = req.body as UserDto;
        const user = convertUserDTOToUser(body);
        await this.service.createAccount(user);
        res.status(201).send();
        loggerWinston.info(`userId: ${req.userId}@account with id ${user._id} is created@createAccount`)
    };

    getAccountById = async (req: AuthRequest, res: Response) => {
        const userId = +req.query.userId!;
        if(!userId) throw new HttpError(400, 'no params', '@getAccountById');
        const user = await this.service.getAccountById(userId);
        if(req.roles?.includes(Role.ADMIN) && user.roles.includes(Role.SUPERVISOR))
            throw new HttpError(401, 'unauthorized', '@getAccountById');
        const userResult = await this.service.getAccount(userId, '@getAccountById');
        res.json(userResult);
        loggerWinston.info(`userId: ${req.userId}@account with id ${userResult._id} is responsed@getAccountById`)
    };

    removeAccount = async (req: AuthRequest, res: Response) => {
        const userId = +req.query.userId!;
        if(!userId) throw new HttpError(400, 'no params', '@removeAccount');
        const user = await this.service.getAccountById(userId);
        if(req.roles?.includes(Role.ADMIN) && (user.roles.includes(Role.SUPERVISOR) ||  user.roles.includes(Role.ADMIN)))
            throw new HttpError(401, 'unauthorized', '@getAccountById');
        if(req.roles?.includes(Role.SUPERVISOR) && user.roles.includes(Role.SUPERVISOR))
            throw new HttpError(401, 'unauthorized', '@getAccountById');
        const userRemove = await this.service.removeAccount(userId);
        res.json(userRemove);
        loggerWinston.info(`userId: ${req.userId}@account with id ${userRemove._id} is removed@removeAccount`)
    };

    changePassword = async (req: AuthRequest, res: Response) => {
        const {oldPassword, newPassword} = req.body;
        const userId = +req.userId!;
        await this.service.changePassword(userId, oldPassword, newPassword);
        res.status(200).send();
        loggerWinston.info(`userId: ${req.userId}@password of account with id ${userId} is changed@changePassword`)
    };

    editAccount = async (req: AuthRequest, res: Response) => {
        const userId = +req.query.userId!;
        const newUserData = req.body as UpdateUserDTO;
        const user = await this.service.getAccountById(userId);
        if(!req.roles?.includes(Role.SUPERVISOR) && (user.roles.includes(Role.SUPERVISOR) || user.roles.includes(Role.ADMIN)))
            throw new HttpError(401, 'unauthorized', '@editAccount');
        if(newUserData.roles?.includes(Role.SUPERVISOR) || (newUserData.roles?.includes(Role.ADMIN) && req.roles?.includes(Role.ADMIN)))
            throw new HttpError(401, 'unauthorized', '@editAccount');
        const userResult = await this.service.editAccount(userId, newUserData);
        res.json(userResult);
        loggerWinston.info(`userId: ${req.userId}@info of account with id ${userId} is updated@changePassword`)
    };

}

export const accountController = new AccountController();