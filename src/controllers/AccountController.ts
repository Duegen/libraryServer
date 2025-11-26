import {Response, Request} from "express";
import {Reader, ReaderDto, UpdateReaderDTO} from "../model/reader.js";
import {accountServiceMongo} from "../service/AccountServiceImpMongo.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {convertReaderDTOToReader} from "../utils/tools.js";
import {loggerWinston} from "../winston/logger.js";
import bcrypt from "bcryptjs";

class AccountController {
    service = accountServiceMongo;

    createReader = async (req: Request, res: Response) => {
        const body = req.body as ReaderDto;
        const reader = convertReaderDTOToReader(body);
        await this.service.createAccount(reader);
        res.status(201).send();
        loggerWinston.info(`account with id ${reader._id} is created@createAccount`)
    };

    getAccountById = async (req: Request, res: Response) => {
        const readerId = +req.query.readerId!;
        if(!readerId) throw new HttpError(400, 'no params', '@getAccountById');
        const reader = await this.service.getAccount(readerId, '@getAccountById');
        res.json(reader);
        loggerWinston.info(`account with id ${reader._id} is responsed@getAccountById`)
    };

    removeAccount = async (req: Request, res: Response) => {
        const readerId = +req.query.readerId!;
        if(!readerId) throw new HttpError(400, 'no params', '@removeAccount');
        const reader = await this.service.removeAccount(readerId);
        res.json(reader);
        loggerWinston.info(`account with id ${reader._id} is removed@removeAccount`)
    };

    changePassword = async (req: Request, res: Response) => {
        const readerId = +req.query.readerId!;
        const salt = bcrypt.genSaltSync(10);
        const newPassHash = bcrypt.hashSync(req.body.password, salt);
        await this.service.changePassword(readerId, newPassHash);
        res.status(200).send();
        loggerWinston.info(`password of account with id ${readerId} is changed@changePassword`)
    };

    editAccount = async (req: Request, res: Response) => {
        const readerId = +req.query.readerId!;
        const newReaderData = req.body as UpdateReaderDTO;
        const reader = await this.service.editAccount(readerId, newReaderData);
        res.json(reader);
        loggerWinston.info(`info of account with id ${readerId} is updated@changePassword`)
    };

}

export const accountController = new AccountController();