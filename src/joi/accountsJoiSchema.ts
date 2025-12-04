import BaseJoi, { Extension, Root } from 'joi'
import JoiDate from '@joi/date'
import {Role} from "../utils/libTypes.js";

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root

export const accountDTOSchema = Joi.object({
    userId: Joi.number().min(100000001).max(999999999).integer().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    birthDate: Joi.date().format('DD.MM.YYYY').max('now').required(),
})

export const accountIdSchema = Joi.object({
    userId: Joi.number().min(100000001).max(999999999).integer().required(),
})

export const accountEditDTOSchema = Joi.object({
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    birthDate: Joi.date().format('DD.MM.YYYY').max('now').optional(),
})

export const accountRolesSchema = Joi.object({
    roles: Joi.array().items(Joi.string().valid(Role.ADMIN, Role.READER, Role.LIBRARIAN))
})

export const accountNewPasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
})