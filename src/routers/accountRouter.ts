import express from "express";
import {accountController} from "../controllers/AccountController.js";

import {
    accountDTOSchema,
    accountIdSchema,
    accountEditDTOSchema,
    accountNewPasswordSchema,
    accountRolesSchema, loginShema, accountId2Schema
} from "../joi/accountsJoiSchema.js";
import {validationBody, validationQuery} from "../middleware/validation.js";

export const accountRouter = express.Router();

const controller = accountController;

accountRouter.post('/', validationBody(accountDTOSchema), controller.createAccount);
accountRouter.get('/byId', validationQuery(accountId2Schema), controller.getAccountById);
accountRouter.delete('/', validationQuery(accountIdSchema), controller.removeAccount);
accountRouter.patch('/password', validationBody(accountNewPasswordSchema), controller.changePassword);
accountRouter.patch('/update', validationQuery(accountId2Schema), validationBody(accountEditDTOSchema), controller.editAccount)
accountRouter.patch('/roles', validationQuery(accountIdSchema), validationBody(accountRolesSchema), controller.setRoles)
accountRouter.post('/login', validationBody(loginShema), controller.login)