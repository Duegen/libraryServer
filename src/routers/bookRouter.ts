import express from "express";
import {bookController} from "../controllers/BookController.js";
import {validationBody, validationParams, validationQuery} from "../middleware/validation.js";
import {bookAuthorSchema, bookDtoSchema, bookSchema, bookGenreSchema, bookIdSchema, bookPicSchema} from "../joi/booksJoiSchema.js";

export const bookRouter = express.Router();

bookRouter.get("/", bookController.getAllBooks);

bookRouter.get('/genres/:genre', validationParams(bookGenreSchema), bookController.getBooksByGenre)

bookRouter.get('/authors/:author', validationParams(bookAuthorSchema), bookController.getBooksByAuthor)

bookRouter.post("/", validationBody(bookDtoSchema), bookController.addBook);

bookRouter.delete('/', validationQuery(bookIdSchema), bookController.removeBook);

bookRouter.patch('/', validationBody(bookSchema), bookController.editBook)

bookRouter.patch('/restore', validationQuery(bookIdSchema), bookController.restoreBook);

bookRouter.patch("/pick", validationQuery(bookPicSchema),bookController.pickBook)

bookRouter.patch("/return", validationQuery(bookIdSchema),bookController.returnBook)
