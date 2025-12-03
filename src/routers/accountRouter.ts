import express from "express";
import {accountController} from "../controllers/AccountController.js";

import {
    accountDTOSchema,
    accountIdSchema,
    accountEditDTOSchema,
    accountNewPasswordSchema,
    accountRolesSchema
} from "../joi/accountsJoiSchema.js";
import {validationBody, validationQuery} from "../middleware/validation.js";

export const accountRouter = express.Router();

const controller = accountController;

accountRouter.post('/', validationBody(accountDTOSchema), controller.createAccount);
accountRouter.get('/byId', validationQuery(accountIdSchema), controller.getAccountById);
accountRouter.delete('/', validationQuery(accountIdSchema), controller.removeAccount);
accountRouter.patch('/password', validationBody(accountNewPasswordSchema), controller.changePassword);
accountRouter.patch('/update', validationQuery(accountIdSchema), validationBody(accountEditDTOSchema), controller.editAccount)
accountRouter.patch('/roles', validationQuery(accountIdSchema), validationBody(accountRolesSchema), controller.setRoles)