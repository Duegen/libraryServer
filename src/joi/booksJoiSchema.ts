import BaseJoi, { Extension, Root } from 'joi'
import JoiDate from '@joi/date'
import {BookGenres} from "../model/book.js";

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root

export const bookDtoSchema = Joi.object({
    title: Joi.string().min(2).max(30).required(),
    author: Joi.string().min(2).max(30).required(),
    genre: Joi.string().valid(...Object.values(BookGenres)).required(),
    year: Joi.number().min(1900).max(new  Date().getFullYear()).integer().required(),
    quantity: Joi.number().min(1).positive().max(100).optional(),
})

export const bookGenreSchema = Joi.object({
    genre: Joi.string().valid(...Object.values(BookGenres)).required(),
})

export const bookIdSchema = Joi.object({
    bookId: Joi.string().required(),
})

export const bookPicSchema = Joi.object({
    bookId: Joi.string().required(),
    readerId: Joi.number().integer().min(100000000).max(999999999).integer().required(),
})

export const bookAuthorSchema = Joi.object({
    author: Joi.string().required(),
})

export const bookSchema = Joi.object({
    _id: Joi.string().required(),
    title: Joi.string().min(2).max(30).optional(),
    author: Joi.string().min(2).max(30).optional(),
    genre: Joi.string().valid(...Object.values(BookGenres)).optional(),
    year: Joi.number().min(1900).max(new  Date().getFullYear()).integer().optional(),
})

