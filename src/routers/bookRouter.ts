import express from "express";
import {bookController} from "../controllers/BookController.js";
import {validationBody, validationParams, validationQuery} from "../validation/validation.js";
import {bookAuthorShema, bookDtoShema, bookShema, bookGenreShema, bookIdShema, bookPicShema} from "../joi/booksJoiShema.js";

export const bookRouter = express.Router();

bookRouter.get("/", bookController.getAllBooks);

bookRouter.get('/genres/:genre', validationParams(bookGenreShema), bookController.getBooksByGenre)

bookRouter.get('/authors/:author', validationParams(bookAuthorShema), bookController.getBooksByAuthor)

bookRouter.post("/", validationBody(bookDtoShema), bookController.addBook);

bookRouter.delete('/', validationQuery(bookIdShema), bookController.removeBook);

bookRouter.patch('/', validationBody(bookShema), bookController.editBook)

bookRouter.patch('/restore', validationQuery(bookIdShema), bookController.restoreBook);

bookRouter.patch("/pick", validationQuery(bookPicShema),bookController.pickBook)

bookRouter.patch("/return", validationQuery(bookIdShema),bookController.returnBook)
