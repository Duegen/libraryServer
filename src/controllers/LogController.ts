import {Response} from "express";
import {loggerWinston} from "../winston/logger.js";
import path from "node:path";
import {logService} from "../service/LogService.js";
import {AuthRequest} from "../utils/libTypes.js";

export class LogController {

    async getLogFile(req: AuthRequest, res: Response) {
        let filePath = '';
        if (Object.values(req.query).length)
            filePath = await logService.getLog(req.query.date + "")
        else filePath = await logService.getLog();
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(500).send('log file not found');
                loggerWinston.error("log file not found");
            } else
                loggerWinston.info(`userId: ${req.userId}@log file for date ${path.parse(filePath).name} successfully sent`);
        })
    }
}

export const logController = new LogController();