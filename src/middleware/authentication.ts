import {AccountService} from "../service/iAccountService.js";
import {NextFunction, Request, Response} from "express";
import bcrypt from "bcryptjs";
import {HttpError} from "../errorHandler/HttpError.js";
import {AuthRequest} from "../utils/libTypes.js";
import {loggerWinston} from "../winston/logger.js";


const BASIC = 'Basic ';

async function getBasicAuth(authHeader: string, service: AccountService, request: AuthRequest, response: Response) {
    const auth = Buffer.from(authHeader.substring(BASIC.length), 'base64')
        .toString('ascii');
    const [userId, password] = auth.split(':');
    try {
        const account = await service.getAccountById(+userId);
        if (bcrypt.compareSync(password, account.passHash)) {
            request.userId = account._id;
            request.userName = account.userName;
            request.roles = account.roles;
            loggerWinston.warn(`user with id ${userId} authenticated@authentication`);
        } else {
            loggerWinston.warn('user not authenticated@authentication');
        }
    } catch (e) {
        throw new HttpError(403, 'access forbidden', '@authentication')
    }
}

export const authenticate = (service: AccountService) => {
    return async (request: Request, response: Response, next: NextFunction) => {
        const authHeader = request.header('Authorization');
        if (authHeader)
            await getBasicAuth(authHeader, service, request, response);
        next();
    }
}

export const skipRoutes = (skipRoutes: string[], pathRoles: {[index: string]: string[]}) => {
    return async (request: AuthRequest, response: Response, next: NextFunction) => {
        const route = request.method + request.path + '';
        if (!request.userId)
            if (!skipRoutes.includes(route))
                throw new HttpError(401, 'unauthorized', '@authorization');
            else next()
        else {
            const path = Object.keys(pathRoles).filter(path => route.match(path))
                .sort((a, b) => b.length-a.length)[0];
            if(!path) {
                next();
            } else{
                const roles = request.roles;
                if(roles?.some(role => pathRoles[path].includes(role))) {
                    next();
                }
                else
                    throw new HttpError(401, 'unauthorized', '@authorization');
            }

        }
    }
}