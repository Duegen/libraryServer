import {AccountService} from "./iAccountService.js";
import {User, UpdateUserDTO} from "../model/user.js";
import {accountDatabase} from "../app.js";
import {HttpError} from "../errorHandler/HttpError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {getJWT} from "../utils/tools.js";

export class AccountServiceImpMongo implements AccountService {

    async login(userId: number, password: string): Promise<string> {
        const database = accountDatabase as mongoose.Model<User>;
        const userDoc = await database.findById(userId).then(doc => doc)
            .catch((err) => {
                throw new Error('database error: ' + err.message + '@login')
            });
        if (!userDoc)
            throw new HttpError(404, `account with id ${userId} is not found`, '@login');
        if (!bcrypt.compareSync(password, userDoc.passHash))
            throw new HttpError(401, "wrong credentials", '@login');
        return getJWT(userId, userDoc.roles);
    }

    async setAccountRole(userId: number, newRoles: string[]): Promise<User> {
        const database = accountDatabase as mongoose.Model<User>;
        const result = await database.findByIdAndUpdate(userId, {
            roles: newRoles,
        }, {new: true}).catch((err: Error) => {
            throw new Error('database error: ' + err.message + '@setAccountRole');
        })
        if(!result)
            throw new HttpError(409, `account with id ${userId} is not found`, '@editAccount');
        const {_id, userName, email, passHash, birthDate, roles } = result as User;
        return {_id, userName, email, passHash, birthDate, roles }
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const database = accountDatabase as mongoose.Model<User>;
        const userDoc = await database.findById(userId).then(doc => doc)
            .catch((err) => {
                throw new Error('database error: ' + err.message + '@changePassword')
            });
        if (!userDoc)
            throw new HttpError(404, `account with id ${userId} is not found`, '@changePassword');
        if (!bcrypt.compareSync(oldPassword, userDoc.passHash))
            throw new HttpError(409, "wrong credentials", '@changePassword');
        userDoc.passHash = bcrypt.hashSync(newPassword, 10);
        await userDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@changePassword');
        });
    }

    async createAccount(user: User): Promise<void> {
        const database = accountDatabase as mongoose.Model<User>;
        const result = await database.findById(user._id).then(doc => doc)
            .catch((err) => {
                throw new Error('database error: ' + err.message + '@createAccount');
            });
        if (result)
            throw new HttpError(404, `duplicated userId ${user._id}, account not created`, '@createAccount');
        await accountDatabase.create({...user, _id: user._id}).catch(err => {
            throw new Error('database error: ' + err.message + '@createAccount')
        })
        return Promise.resolve();
    }

    async editAccount(userId: number, newUserData: UpdateUserDTO): Promise<User> {
        const database = accountDatabase as mongoose.Model<User>;

        const result = await database.findByIdAndUpdate(userId, {
            userName: newUserData.userName,
            email: newUserData.email,
            birthDate: newUserData.birthDate,
        }, {new: true}).catch(err => {
            throw new Error('database error: ' + err.message + '@editAccount');
        })
        if(!result)
            throw new HttpError(404, `account with id ${userId} is not found`, '@editAccount');
        const {_id, userName, email, passHash, birthDate, roles } = result as User;
        return {_id, userName, email, passHash, birthDate, roles }
    }

    async getAccountById(userId: number): Promise<User> {
        const database = accountDatabase as mongoose.Model<User>;
        const userDoc = await database.findById(userId).then(doc => doc)
            .catch((err) => {
                throw new Error('database error: ' + err.message + '@getAccountById');
            });
        if (!userDoc)
            throw new HttpError(404, `account with id ${userId} is not found`, '@getAccountById');
        return userDoc;
    }

    async removeAccount(userId: number): Promise<User> {
        const database = accountDatabase as mongoose.Model<User>;
        const result = await database.findByIdAndDelete(userId).catch(err => {
            throw new Error('database error: ' + err.message + '@removeAccount');
        });
        if(!result)
            throw new HttpError(404, `account with id ${userId} is not found`, '@removeAccount');
        return result;
    }
}

export const accountServiceMongo = new AccountServiceImpMongo();
