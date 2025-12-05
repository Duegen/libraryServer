import {AuthRequest} from "../utils/libTypes.js";
import {Response, NextFunction} from "express";
import {HttpError} from "../errorHandler/HttpError.js";

export const authorize = (pathRoles: Record<string, string[]>) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const route = req.method + req.path + '';
        const path = Object.keys(pathRoles).filter(path => route.match(path))
            .sort((a, b) => b.length-a.length)[0];
        if(!path) {
            next();
        } else{
            const roles = req.roles;
            if(roles?.some(role => pathRoles[path].includes(role))) {
                next();
            }else
                throw new HttpError(403, '', '@authorization');
        }
    }
}