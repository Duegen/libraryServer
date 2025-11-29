import express, {Request, Response} from "express";
import {logController} from "../controllers/LogController.js";
import {validationQuery} from "../middleware/validation.js";
import {dateLogSchema} from "../joi/logsJoiSchema.js";

export const logRouter = express.Router();

logRouter.get("/", async (req:Request, res: Response) => {
    await logController.getLogFile(req, res);
})

logRouter.get('/dates',  validationQuery(dateLogSchema), async (req:Request, res: Response) => {
    await logController.getLogFile(req, res);
})