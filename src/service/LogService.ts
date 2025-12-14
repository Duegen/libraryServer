import {fileURLToPath} from "node:url";
import path from "node:path";
import * as fs from "node:fs";
import {HttpError} from "../errorHandler/HttpError.js";
import * as util from "node:util";

export class LogService {
    private logDir = path.join(path.dirname(fileURLToPath(import.meta.url)),"../../../logs/")
    private pattern = /^\d{2}.\d{2}.\d{4}.txt$/;

    async getLog(date = ''): Promise<string>{
        const readDir = util.promisify(fs.readdir)
        let files = await readDir(this.logDir).catch(() => {
            throw new HttpError(404, 'log directory not found', '@getLog')
        });
        files = files.filter(file => {
            return !!file.match(this.pattern);
        })
        if(!files.length)
            throw new HttpError(404, 'log files not found', '@getLog')
        files.reverse();
        if(date){
            const file = files.find(file => file === date + '.txt')
            if(file)
                return this.logDir + '\\' + file;
            else
                throw new HttpError(404, `log file for date ${date} not found`, '@getLog')
        }
        else
            return this.logDir + '\\' + files[0];
    }
}

export const logService = new LogService();