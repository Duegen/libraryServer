import express from "express";
import {accountController} from "../controllers/AccountController.js";

import {accountDTOShema, accountIdShema, accountEditDTOShema, accountPasswordSchema} from "../joi/accountsJoiShema.js";
import {validationBody, validationQuery} from "../validation/validation.js";

export const accountRouter = express.Router();

const controller = accountController;

accountRouter.post('/', validationBody(accountDTOShema), controller.createReader);
accountRouter.get('/byId', validationQuery(accountIdShema), controller.getAccountById);
accountRouter.delete('/', validationQuery(accountIdShema), controller.removeAccount);
accountRouter.patch('/password', validationQuery(accountIdShema), validationBody(accountPasswordSchema), controller.changePassword);
accountRouter.patch('/update', validationQuery(accountIdShema), validationBody(accountEditDTOShema), controller.editAccount)