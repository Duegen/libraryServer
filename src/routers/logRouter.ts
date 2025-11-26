import express, {Request, Response} from "express";
import {logController} from "../controllers/LogController.js";
import {validationQuery} from "../validation/validation.js";
import {dateLogShema} from "../joi/logsJoiShema.js";

export const logRouter = express.Router();

logRouter.get("/", async (req:Request, res: Response) => {
    await logController.getLogFile(req, res);
})

logRouter.get('/dates',  validationQuery(dateLogShema), async (req:Request, res: Response) => {
    await logController.getLogFile(req, res);
})