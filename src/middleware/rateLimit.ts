import {rateLimit, ipKeyGenerator} from "express-rate-limit";
import {Response} from "express";
import {AuthRequest} from "../utils/libTypes.js";
import {config} from "../configuration/appConfig.js";
import {loggerWinston} from "../winston/logger.js";

export const unloggedInLimit = rateLimit({
    windowMs: 60*1000,
    limit: config.anonymous_rate_limit,
    keyGenerator: (req: AuthRequest, res: Response) => ipKeyGenerator(req.ip!),
    message: (req: AuthRequest, res: Response) => {
        loggerWinston.error(`exceeded the limit of requests per minute for unregistered user`);
        return `exceeded the limit of requests per minute for unregistered user`;
    }
})

export const loggedInLimit = rateLimit({
    windowMs: 60*1000,
    limit: (req: AuthRequest, res: Response) => {
        const status = req.roles?.find((role) => Object.keys(config.status_roles).includes(role))
        return status ? (config.status_roles[status] >= 0 ? config.status_roles[status] : Infinity)
            : config.default_rate_limit;
        },
    message: (req: AuthRequest, res: Response) => {
        loggerWinston.error(`exceeded the limit of requests per minute for userId ${req.userId}`)
        return `exceeded the limit of requests per minute for userId ${req.userId}`
    },
    keyGenerator: (req: AuthRequest, res: Response) => req.userId + ''
})

