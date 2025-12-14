import {LogService} from "../../../../src/service/LogService.js";

jest.mock('fs')

import fs from 'fs'
import path from "node:path";
import {fileURLToPath} from "node:url";

describe('LogService.getLog', () => {
    const logService = new LogService()
    const logDir = path.join(path.dirname(fileURLToPath(import.meta.url)),"../../../logs/")

    test('failed test: log files not found', async () => {
        const files = [
            'somefile.txt',
        ];
        (fs.readdir as unknown as jest.Mock).mockReturnValue(files);
        await expect(logService.getLog()).resolves.toThrow('log files not found');
        expect(fs.readdir).toHaveBeenCalledWith(logDir);
    })

    test('failed test: log files for date not found', async () => {
        const date = '14.12.2025'
        const files = [
            '01.01.2000.txt',
        ];
        (fs.readdir as unknown as jest.Mock).mockReturnValue(files);
        await expect(logService.getLog(date)).resolves.toThrow(`log file for date ${date} not found`);
        expect(fs.readdir).toHaveBeenCalledWith(logDir);
    })

    test('passed test: log file without date is found', async () => {
        const files = [
            '01.01.2000.txt',
        ];
        (fs.readdir as unknown as jest.Mock).mockReturnValue(files);
        const result = await logService.getLog();
        expect(result).toEqual(logDir + '\\' + '01.01.2000.txt');
        expect(fs.readdir).toHaveBeenCalledWith(logDir);
    })

    test('passed test: log file with date is found', async () => {
        const date = '14.12.2025'
        const files = [
            '01.01.2000.txt',
            '14.12.2025.txt'
        ];
        (fs.readdir as unknown as jest.Mock).mockReturnValue(files);
        const result = await logService.getLog(date);
        expect(result).toEqual(logDir + '\\' + '14.12.2025.txt');
        expect(fs.readdir).toHaveBeenCalledWith(logDir);
    })
})