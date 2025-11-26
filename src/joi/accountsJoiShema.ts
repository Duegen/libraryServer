import BaseJoi, { Extension, Root } from 'joi'
import JoiDate from '@joi/date'

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root

export const accountDTOShema = Joi.object({
    readerId: Joi.number().min(1).max(999999999).required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    birthDate: Joi.date().format('DD.MM.YYYY').max('now').required(),
})

export const accountIdShema = Joi.object({
    readerId: Joi.number().min(1).max(999999999).required(),
})

export const accountEditDTOShema = Joi.object({
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    birthDate: Joi.date().format('DD.MM.YYYY').max('now').optional(),
})

export const accountPasswordSchema = Joi.object({
    password: Joi.string().required(),
})