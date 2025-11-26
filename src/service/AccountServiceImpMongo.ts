import {AccountService} from "./iAccountService.js";
import {Reader, UpdateReaderDTO} from "../model/reader.js";
import {accountDatabase} from "../app.js";
import {HttpError} from "../errorHandler/HttpError.js";
import mongoose from "mongoose";

class AccountServiceImpMongo implements AccountService {
    async changePassword(readerId: number, newPassHash: string): Promise<void> {
        const docReader = await this.getAccount(readerId, '@changePassword');
        docReader.passHash = newPassHash;
        await docReader.save().catch(err => {
            throw new Error('database error: ' + err.message + '@changePassword');
        });
    }

    async createAccount(reader: Reader): Promise<void> {
        await accountDatabase.create({...reader, _id: reader._id}).catch(err => {
            if(err.code === 11000) throw new HttpError(409, 'duplicate readerId, account not created','@createAccount')
            else throw new Error('database error: ' + err.message + '@createAccount')
        })
        return Promise.resolve();
    }

    async editAccount(readerId: number, newReaderData: UpdateReaderDTO): Promise<Reader> {
        const docReader = await this.getAccount(readerId, '@editAccount')
        docReader.userName = newReaderData.userName || docReader.userName;
        docReader.email = newReaderData.email || docReader.email;
        docReader.birthDate = newReaderData.birthDate || docReader.birthDate;
        await docReader.save().catch(err => {
            throw new Error('database error: ' + err.message + '@updateAccount');
        });
        return docReader;
    }

    async getAccount(readerId: number, source: string) {
        const database = accountDatabase as mongoose.Model<Reader>;
        const docReader = await database.findById(readerId).then(doc => doc)
            .catch((err) => {
            throw new Error('database error: ' + err.message + source)
        });
        if (!docReader)
            throw new HttpError(409, `account with id ${readerId} is not found`, source);
        return docReader;
    }

    async getAccountById(readerId: number): Promise<Reader> {
        return await this.getAccount(readerId, 'getAccountById');
    }

    async removeAccount(readerId: number): Promise<Reader> {
        const docReader = await this.getAccount(readerId, '@removeAccount');
        await docReader.deleteOne().catch(err => {
            throw new Error('database error: ' + err.message + '@removeAccount');
        });
        return docReader;
    }

}

export const accountServiceMongo = new AccountServiceImpMongo();