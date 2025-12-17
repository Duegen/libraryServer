import {AccountService} from "../service/iAccountService.js";
import {NextFunction, Request, Response} from "express";
import bcrypt from "bcryptjs";
import {HttpError} from "../errorHandler/HttpError.js";
import {AuthRequest} from "../utils/libTypes.js";
import {loggerWinston} from "../winston/logger.js";
import jwt, {JwtPayload} from "jsonwebtoken";
import {config} from "../configuration/appConfig.js";
import {getAccessLevel} from "../utils/tools.js";


const BASIC = 'Basic ';
const BEARER = 'Bearer ';

async function getBasicAuth(authHeader: string, service: AccountService, request: AuthRequest, response: Response) {
    const auth = Buffer.from(authHeader.substring(BASIC.length), 'base64')
        .toString('ascii');
    const [userId, password] = auth.split(':');
    if(userId === process.env.OWNER && password === process.env.OWNER_PASS) {
        request.userId = 100000000;
        request.roles = [...config.supervisor_roles];
        request.accessLevel = config.supervisor_access;
    }else {
        try {
            const account = await service.getAccountById(+userId);
            if (bcrypt.compareSync(password, account.passHash)) {
                request.userId = account._id;
                request.userName = account.userName;
                request.roles = account.roles;
                request.accessLevel = getAccessLevel(account.roles)
                loggerWinston.warn(`user with id ${userId} authenticated@authentication`);
            } else {
                loggerWinston.warn('user not authenticated@authentication');
            }
        } catch (e) {
            throw new HttpError(401, '', '@authentication')
        }
    }
}

function getJWTAuth(authHeader: string, request: AuthRequest) {
    const token = authHeader.substring(BEARER.length);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        request.roles = JSON.parse(payload.roles);
        request.userId = +payload.sub!;
        request.userName = "Anonymous"
    } catch (e) {
        throw new HttpError(401, '', '@authentication')
    }
}

export const authenticate = (service: AccountService) => {
    return async (request: Request, response: Response, next: NextFunction) => {
        const authHeader = request.header('Authorization');
        if (authHeader &&  authHeader.startsWith(BASIC))
            await getBasicAuth(authHeader, service, request, response);
        else if(authHeader &&  authHeader.startsWith(BEARER))
            getJWTAuth(authHeader, request);
        next();
    }
}

export const skipRoutes = (skipRoutes: string[]) => {
    return async (request: AuthRequest, response: Response, next: NextFunction) => {
        const route = request.method + request.path + '';
        if (!request.userId){
            if(!skipRoutes.some(element => {
                return element === route || route.startsWith(element + '/')
            }))
                throw new HttpError(401, '', '@authorization');
        }
            // if (!skipRoutes.includes(route))
            //     throw new HttpError(401, '', '@authorization');
        next()
    }
}