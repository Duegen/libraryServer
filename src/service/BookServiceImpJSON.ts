import {BookService} from "./iBookService.js";
import {Book, BookEdit, BookStatus} from "../model/book.js";
import {booksDatabase} from "../app.js";
import {JsonDB} from "node-json-db";
import {HttpError} from "../errorHandler/HttpError.js";

export class BookServiceImpJSON implements BookService{

    async addBook(book: Book): Promise<void> {
        const jsonDB = booksDatabase as JsonDB;
        const index = await jsonDB.getIndex('/books', book._id!, '_id');
        if(index !== -1)
            throw new HttpError(404, `duplicated bookId ${book._id}, book not added`, '@addBook');
        await jsonDB.push(`/books[]`, book).catch( err => {
            throw new Error('database error: ' + err.message + '@addBooks');
        });
        return Promise.resolve();
    }

    async getAllBooks(): Promise<Book[]> {
        const jsonDB = booksDatabase as JsonDB;
        const books: Book[] = await jsonDB.getData('/books').catch(err => {
            throw new Error('database error: ' + err.message + '@getAllBooks');
        });
        return Promise.resolve(books);
    }

    async getBooks(path: string, property: string, value: string): Promise<Book[]> {
        try {
            const jsonDB = booksDatabase as JsonDB;
            const books: Book[] = [];
            const booksCount = await jsonDB.count('/books');
            for (let i = 0; i < booksCount; i++) {
                if (await jsonDB.getData(path + `[${i}]/` + property) === value) {
                    const book: Book = await jsonDB.getData(path + `[${i}]/`);
                    books.push(book);
                }
            }
            return Promise.resolve(books);
        } catch (err) {
            throw new Error('database error');
        }
    }

    async getBooksByAuthor(author: string): Promise<Book[]> {
        return await this.getBooks('/books', 'author', author).catch(err => {
            throw new Error(err.message + '@getBooksByAuthor');
        });
    }

    async getBooksByGenre(genre: string): Promise<Book[]> {
        return await this.getBooks('/books', 'genre', genre).catch(err => {
            throw new Error(err.message + '@getBooksByGenre');
        });
    }

    async pickBook(bookId: string, readerId: number, readerName: string): Promise<Book> {
        try {
            const jsonDB = booksDatabase as JsonDB;
            const index = await jsonDB.getIndex('/books', bookId, '_id');
            if (index === -1)
                throw new HttpError(404, `book with id ${bookId} is not found`, '@pickBook');
            const book: Book = await jsonDB.getData(`/books[${index}]`);
            if (book.status === BookStatus.ON_HAND)
                throw new HttpError(409, `book with id ${bookId} is already on hand and can't be picked`, '@pickBook');
            if (book.status === BookStatus.REMOVED)
                throw new HttpError(409, `book with id ${bookId} is removed and can't be picked`, '@pickBook');
            book.status = BookStatus.ON_HAND;
            book.pickList.push({
                readerId: readerId,
                readerName: readerName,
                pickDate: new Date().toLocaleDateString(),
                returnDate: null
            })
            await jsonDB.push(`/books[${index}]`, book);
            return Promise.resolve(book);
        } catch (err) {
            if(err instanceof HttpError)
                throw new HttpError(err.status, err.message, '@pickBook');
            else
                throw new Error('database error@pickBook');
        }

    }

    async returnBook(bookId: string): Promise<Book> {
        try {
            const jsonDB = booksDatabase as JsonDB;
            const index = await jsonDB.getIndex('/books', bookId, '_id');
            if (index === -1)
                throw new HttpError(404, `book with id ${bookId} is not found`,'@returnBook')
            const book: Book = await jsonDB.getData(`/books[${index}]`);
            if (book.status === BookStatus.IN_STOCK)
                throw new HttpError(409, `book with id '${bookId}' is not on hand and can't be returned`,'@returnBook');
            if (book.status === BookStatus.REMOVED)
                throw new HttpError(409, `book with id '${bookId}' is removed and can't be returned`,'@returnBook');
            const pickIndex = book.pickList.findIndex(list => !list.returnDate)
            if(pickIndex === -1)
                throw new HttpError(409, `pick record for book with id '${bookId}' is not found`,`@returnBook`)
            book.status = BookStatus.IN_STOCK;
            book.pickList[pickIndex].returnDate = new Date().toLocaleDateString();
            await jsonDB.push(`/books[${index}]`, book);
            return Promise.resolve(book);
        } catch (err) {
            if(err instanceof HttpError)
                throw new HttpError(err.status, err.message,'@returnBook');
            else
                throw new Error('database error@returnBook');
        }
    }

    async editBook(data: BookEdit): Promise<Book> {
        try {
            const jsonDB = booksDatabase as JsonDB;
            const index = await jsonDB.getIndex('/books', data._id, '_id');
            if (index === -1)
                throw new HttpError(404, `book with id ${data._id} is not found`, '@editBook');
            const book: Book = await jsonDB.getData(`/books[${index}]`);
            if (book.status === BookStatus.REMOVED)
                throw new HttpError(409, `book with id '${data._id}' is removed and can't be edited`, '@editBook');
            book.title = data.title || book.title;
            book.author = data.author || book.author;
            book.genre = data.genre || book.genre;
            book.year = data.year || book.year;
            await jsonDB.push(`/books[${index}]`, book);
            return Promise.resolve(book)
        } catch (err) {
            if(err instanceof HttpError)
                throw new HttpError(err.status, err.message, '@editBook');
            else
                throw new Error('database error@editBook');
        }
    }

    async removeBook(bookId: string): Promise<Book> {
        try {
            const jsonDB = booksDatabase as JsonDB;
            const index = await jsonDB.getIndex('/books', bookId, '_id');
            if (index === -1)
                throw new HttpError(404, `book with id ${bookId} is not found`, '@removeBook');
            const book: Book = await jsonDB.getData(`/books[${index}]`);
            if (book.status === BookStatus.ON_HAND)
                throw new HttpError(409, `book with id ${bookId} is already on hand and can't be removed`, '@removeBook');
            if (book.status === BookStatus.REMOVED) {
                book.status = BookStatus.DELETED;
                await jsonDB.delete(`/books[${index}]`);
                return Promise.resolve(book);
            } else {
                book.status = BookStatus.REMOVED;
                await jsonDB.push(`/books[${index}]`, book);
                return Promise.resolve(book);
            }
        } catch (err) {
            if(err instanceof HttpError)
                throw new HttpError(err.status, err.message, '@removeBook');
            else
                throw new Error('database error@removeBook');
        }
    }

    async restoreBook(bookId: string): Promise<Book> {
        try {
            const jsonDB = booksDatabase as JsonDB;
            const index = await jsonDB.getIndex('/books', bookId, '_id');
            if (index === -1)
                throw new HttpError(404, `book with id ${bookId} is not found`, '@restoreBook');
            const book: Book = await jsonDB.getData(`/books[${index}]`);
            if (book.status !== BookStatus.REMOVED)
                throw new HttpError(409, `book with id '${bookId}' is not removed and can't be restored`, '@restoreBook');
            book.status = BookStatus.IN_STOCK;
            await jsonDB.push(`/books[${index}]`,book);
            return Promise.resolve(book);
        } catch (err) {
            if(err instanceof HttpError)
                throw new HttpError(err.status, err.message, '@restoreBook');
            else
                throw new Error('database error@restoreBook');
        }
    }
}

export const bookServiceJSON = new BookServiceImpJSON();