import {AccountService} from "./iAccountService.js";
import {User, UpdateUserDTO} from "../model/user.js";
import {accountDatabase} from "../app.js";
import {HttpError} from "../errorHandler/HttpError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {Role} from "../utils/libTypes.js";
import {getJWT} from "../utils/tools.js";

export class AccountServiceImpMongo implements AccountService {

    async login(userId: number, password: string): Promise<string> {
        const user = await this.getAccount(userId, '@login')
        if(!bcrypt.compareSync(password, user.passHash))
            throw new HttpError(401, "wrong credentials", '@login');
        return getJWT(userId, user.roles);
    }

    async setAccountRole(userId: number, roles: Role[]): Promise<User>{
        const userDoc = await this.getAccount(userId, '@setRoles');
        userDoc.roles = roles;
        await userDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@setRoles');
        });
        return userDoc;
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const userDoc = await this.getAccount(userId, '@changePassword');
        if(!bcrypt.compareSync(oldPassword, userDoc.passHash))
            throw new HttpError(401, "wrong credentials", '@changePassword');
        userDoc.passHash = bcrypt.hashSync(newPassword, 10);
        await userDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@changePassword');
        });
    }

    async createAccount(user: User): Promise<void> {
        await accountDatabase.create({...user, _id: user._id}).catch(err => {
            if(err.code === 11000) throw new HttpError(409, 'duplicate readerId, account not created','@createAccount')
            else throw new Error('database error: ' + err.message + '@createAccount')
        })
        return Promise.resolve();
    }

    async editAccount(userId: number, newUserData: UpdateUserDTO): Promise<User> {
        const userDoc = await this.getAccount(userId, '@editAccount')
        userDoc.userName = newUserData.userName || userDoc.userName;
        userDoc.email = newUserData.email || userDoc.email;
        userDoc.birthDate = newUserData.birthDate || userDoc.birthDate;
        await userDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@updateAccount');
        });
        return userDoc;
    }

    async getAccount(userId: number, source: string) {
        const database = accountDatabase as mongoose.Model<User>;
        const userDoc = await database.findById(userId).then(doc => doc)
            .catch((err) => {
            throw new Error('database error: ' + err.message + source)
        });
        if (!userDoc)
            throw new HttpError(404, `account with id ${userId} is not found`, source);
        return userDoc;
    }

    async getAccountById(userId: number): Promise<User> {
        return await this.getAccount(userId, '@getAccountById');
    }

    async removeAccount(userId: number): Promise<User> {
        const userDoc = await this.getAccount(userId, '@removeAccount');
        await userDoc.deleteOne().catch(err => {
            throw new Error('database error: ' + err.message + '@removeAccount');
        });
        return userDoc;
    }
}

export const accountServiceMongo = new AccountServiceImpMongo();