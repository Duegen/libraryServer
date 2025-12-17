import {BookService} from "./iBookService.js";
import {Book, BookEdit, BookStatus} from "../model/book.js";
import {booksDatabase} from "../app.js";
import * as mongoose from "mongoose";
import {HttpError} from "../errorHandler/HttpError.js";

export class BookServiceImpMongo implements BookService {

    async getBooks(options: Object): Promise<Book[]>{
        const model = booksDatabase as mongoose.Model<Book>
        return await model.find(options)
            .catch((err) => {
                throw new Error('database error: ' + err.message);
            })
    }

    async getAllBooks(): Promise<Book[]> {
        return await this.getBooks({}).then(data => data).catch(err => {
            throw new Error(err.message + '@getAllBooks');
        });
    }

    async getBooksByAuthor(author: string): Promise<Book[]> {
        return await this.getBooks({author: author}).then(data => data).catch(err => {
            throw new Error(err.message + '@getBooksByAuthor');
        });
    }

    async getBooksByGenre(genre: string): Promise<Book[]> {
        return await this.getBooks({genre:genre}).then(data => data).catch(err => {
            throw new Error(err.message + '@getBooksByGenre');
        });
    }

    async addBook(book: Book): Promise<void> {
        const database = booksDatabase as mongoose.Model<Book>;
        const result = await database.findById(book._id).then(doc => doc)
            .catch((err) => {
                throw new Error('database error: ' + err.message + '@addBook');
            });
        if (result)
            throw new HttpError(409, `duplicated bookId ${book._id}, book not added`, '@addBook');
        await database.create({...book, _id: book._id}).catch((err) => {
            throw new Error('database error: ' + err.message + '@addBook')
        });
    }

    async getBookById(bookId: string, source: string) {
        const model = booksDatabase as mongoose.Model<Book>;
        const bookDoc = await model.findById(bookId)
            .then(bookDoc => bookDoc)
            .catch((err) => {
                throw new Error('database error: ' + err.message + source)
            });
        if(!bookDoc)
            throw new HttpError(404, `book with id ${bookId} is not found`, source)
        return bookDoc;
    }

    async removeBook(bookId: string): Promise<Book> {
        const bookDoc = await this.getBookById(bookId, '@removeBook');
        if(bookDoc.status === BookStatus.ON_HAND)
            throw new HttpError(409, `y`,`@removeBook`)
        if(bookDoc.status === BookStatus.REMOVED){
            bookDoc.status = BookStatus.DELETED;
            await bookDoc.deleteOne().catch(err => {
                throw new Error('database error: ' + err.message + '@removeBook');
            });
        }else{
            bookDoc.status = BookStatus.REMOVED;
            await bookDoc.save().catch(err => {
                throw new Error('database error: ' + err.message + '@removeBook');
            });
        }
        return Promise.resolve(bookDoc as Book);
    }

    async editBook(editData: BookEdit):Promise<Book>{
        const bookDoc = await this.getBookById(editData._id, '@editBook')
        if(bookDoc.status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${editData._id}' is removed and can't be edited`,`@editBook`)
        bookDoc.title = editData.title || bookDoc.title;
        bookDoc.author = editData.author || bookDoc.author;
        bookDoc.genre = editData.genre || bookDoc.genre;
        bookDoc.year = editData.year || bookDoc.year;
        await bookDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@editBook');
        });
        return Promise.resolve(bookDoc as Book);
    };

    async restoreBook(bookId: string):Promise<Book>{
        const bookDoc = await this.getBookById(bookId,  '@restoreBook');
        if(bookDoc.status !== BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${bookId}' is not removed and can't be restored`,`@restoreBook`)
        bookDoc.status = BookStatus.IN_STOCK;
        await bookDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@restoreBook');
        });
        return Promise.resolve(bookDoc as Book);
    }

    async pickBook(bookId: string, readerId: number, readerName: string):Promise<Book> {
        const bookDoc = await this.getBookById(bookId, '@pickBook');
        if (bookDoc.status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id ${bookId} is removed and can't be picked`,`@pickBook`);
        if (bookDoc.status === BookStatus.ON_HAND)
            throw new HttpError(409, `book with id ${bookId} is already on hand`,`@pickBook`)
        bookDoc.status = BookStatus.ON_HAND;
        bookDoc.pickList.push({
            readerId: readerId,
            readerName: readerName,
            pickDate: new Date().toLocaleDateString(),
            returnDate: null
        })
        await bookDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@pickBook');
        });
        return Promise.resolve(bookDoc as Book);
    }

    async returnBook(bookId: string): Promise<Book> {
        const bookDoc = await this.getBookById(bookId, '@returnBook');
        if (bookDoc.status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${bookId}' is removed and can't be returned`,`@returnBook`)
        if (bookDoc.status === BookStatus.IN_STOCK)
            throw new HttpError(409, `book with id '${bookId}' is not on hand and can't be returned`,`@returnBook`)
        bookDoc.status = BookStatus.IN_STOCK;
        const index = bookDoc.pickList.findIndex(list => !list.returnDate)
        if(index === -1)
            throw new HttpError(409, `pick record for book with id '${bookId}' is not found`,`@returnBook`)
        bookDoc.pickList[index].returnDate = new Date().toLocaleDateString();
        await bookDoc.save().catch(err => {
            throw new Error('database error: ' + err.message + '@returnBook');
        });
        return Promise.resolve(bookDoc as Book);
    }
}

export const bookServiceMongo = new BookServiceImpMongo();