import {BookService} from "./iBookService.js";
import {Book, BookEdit, BookLite, BookStatus} from "../model/book.js";
import {booksDatabase} from "../app.js";
import * as mongoose from "mongoose";
import {v4 as uuidv4} from 'uuid';
import {HttpError} from "../errorHandler/HttpError.js";
import {AccountService} from "./iAccountService.js";
import {accountServiceMongo} from "./AccountServiceImpMongo.js";
import {Role} from "../utils/libTypes.js";

class BookServiceImpMongo implements BookService {
    private service: AccountService = accountServiceMongo;

    async getBooks(options: Object, excess: boolean): Promise<Book[] | BookLite[]>{
        const model = booksDatabase as mongoose.Model<Book>
        const books = await model.find(options)
            .catch((err) => {
                throw new Error('database error: ' + err.message);
            });
        if(excess)
            return books
        else{
            const booksLite: BookLite[] = [];
            books.forEach(book => {
                booksLite.push({title: book.title,
                    author: book.author,
                    genre: book.genre,
                    year: book.year,
                    status: book.status,});
            })
            return booksLite;
        }
    }

    async getAllBooks(excess: boolean): Promise<Book[] | BookLite[]> {
        return await this.getBooks({}, excess).then(data => data).catch(err => {
            throw new Error(err.message + '@getAllBooks');
        });
    }

    async getBooksByAuthor(author: string, excess: boolean): Promise<Book[] | BookLite[]> {
        return await this.getBooks({author: author}, excess).then(data => data).catch(err => {
            throw new Error(err.message + '@getBooksByAuthor');
        });
    }

    async getBooksByGenre(genre: string, excess: boolean): Promise<Book[] | BookLite[]> {
        return await this.getBooks({genre:genre}, excess).then(data => data).catch(err => {
            throw new Error(err.message + '@getBooksByGenre');
        });
    }

    async addBook(book: Book): Promise<void> {
        const model = booksDatabase as mongoose.Model<Book>;
        await model.create({...book, _id: uuidv4()}).catch((err) => {
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
            throw new HttpError(409, `book with id ${bookId} is not found`, source)
        return bookDoc;
    }

    async removeBook(bookId: string): Promise<Book> {
        const bookDoc = await this.getBookById(bookId, '@removeBook');
        if(bookDoc.status === BookStatus.ON_HAND)
            throw new HttpError(409, `book with id '${bookId}' is on hand and can't be removed`,`@removeBook`)
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

    async pickBook(bookId: string, readerId: number): Promise<void> {
        const account = await this.service.getAccountById(readerId);
        const bookDoc = await this.getBookById(bookId, '@pickBook');
        if (bookDoc.status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id ${bookId} is removed and can't be picked`,`@pickBook`);
        if (bookDoc.status === BookStatus.ON_HAND)
            throw new HttpError(409, `book with id ${bookId} is already on hand`,`@pickBook`)
        if(!account.roles.includes(Role.READER))
            throw new HttpError(409, `user is not reader`,`@pickBook`)
        bookDoc.status = BookStatus.ON_HAND;
        bookDoc.pickList.push({
            readerId: account._id,
            readerName: account.userName,
            pickDate: new Date().toLocaleDateString(),
            returnDate: null
        })
        await bookDoc.save().then(() => {
            return Promise.resolve();
        }).catch(err => {
            throw new Error('database error: ' + err.message + '@pickBook');
        });
    }

    async returnBook(bookId: string): Promise<void> {
        const bookDoc = await this.getBookById(bookId, '@returnBook');
        if (bookDoc.status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${bookId}' is removed and can't be returned`,`@returnBook`)
        if (bookDoc.status === BookStatus.IN_STOCK)
            throw new HttpError(409, `book with id '${bookId}' is not on hand and can't be returned`,`@returnBook`)
        bookDoc.status = BookStatus.IN_STOCK;
        const index = bookDoc.pickList.findIndex(list => !list.returnDate)
        bookDoc.pickList[index].returnDate = new Date().toLocaleDateString();
        await bookDoc.save().then(() => {
            return Promise.resolve();
        }).catch(err => {
            throw new Error('database error: ' + err.message + '@returnBook');
        });
    }
}

export const bookServiceMongo = new BookServiceImpMongo();