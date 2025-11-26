import BaseJoi, { Extension, Root } from 'joi'
import JoiDate from '@joi/date'

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root

export const dateLogShema = Joi.object({
    date: Joi.date().format('DD.MM.YYYY').max('now').required(),
})