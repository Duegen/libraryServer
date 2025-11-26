import BaseJoi, { Extension, Root } from 'joi'
import JoiDate from '@joi/date'
import {BookGenres} from "../model/book.js";

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root

export const bookDtoShema = Joi.object({
    title: Joi.string().min(2).max(30).required(),
    author: Joi.string().min(2).max(30).required(),
    genre: Joi.string().valid(...Object.values(BookGenres)).required(),
    year: Joi.number().min(1900).max(new  Date().getFullYear()).integer().required(),
    quantity: Joi.number().min(1).positive().max(100).optional(),
})

export const bookGenreShema = Joi.object({
    genre: Joi.string().valid(...Object.values(BookGenres)).required(),
})

export const bookIdShema = Joi.object({
    bookId: Joi.string().required(),
})

export const bookPicShema = Joi.object({
    bookId: Joi.string().required(),
    readerName: Joi.string().min(3).required(),
    readerId: Joi.number().integer().min(1).required(),
})

export const bookAuthorShema = Joi.object({
    author: Joi.string().required(),
})

export const bookShema = Joi.object({
    _id: Joi.string().required(),
    title: Joi.string().min(2).max(30).optional(),
    author: Joi.string().min(2).max(30).optional(),
    genre: Joi.string().valid(...Object.values(BookGenres)).optional(),
    year: Joi.number().min(1900).max(new  Date().getFullYear()).integer().optional(),
})

