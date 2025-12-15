import {BookService} from "./iBookService.js";
import {Book, BookEdit, BookStatus, PickRecord} from "../model/book.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {ResultSetHeader, RowDataPacket} from "mysql2";
import {booksDatabase} from "../app.js";
import {Pool} from "mysql2/promise";

export class BookServiceImpSql implements BookService {

    async addBook(book: Book): Promise<void> {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE _id = ?', book._id)
            .catch(() => {
                throw new Error('database connection error')
            });
        if (result.length)
            throw new HttpError(409, `duplicated bookId '${book._id}', book not added`, '@addBook');
        await pool.query(`INSERT INTO books VALUES (?, ?, ?, ?, ?, ?)`,
            [book._id, book.title, book.author, book.genre, book.status, book.year])
            .catch(() => {
                throw new Error('database connection error@addBook')
            })
    }

    async formPickList(bookId: string) {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>
        ('SELECT * FROM books_readers INNER JOIN readers ' +
            'ON books_readers.readerId=readers.readerId AND books_readers._id=?', bookId)
            .catch(() => {
                throw new Error('database connection error')
            })
        return Promise.resolve(result.map(unit => {
            delete unit._id;
            return unit;
        }));
    }

    async getBooks(query: string, source: string) {
        const pool = booksDatabase as Pool;
        const books = await pool.query<RowDataPacket[]>(query).then(async data => {
            const [result] = data;
            return result.map(async book => {
                book = {...book, pickList: []};
                const pickList = await this.formPickList(book._id)
                book.pickList.push(...pickList);
                return book;
            })
        }).catch((err) => {
            throw new Error(err.message + source);
        })
        const result = await Promise.all(books) as Book[];
        return Promise.resolve(result);
    }

    async getAllBooks(): Promise<Book[]> {
        return await this.getBooks('SELECT * FROM books', '@getAllBooks');
    }

    async getBooksByGenre(genre: string): Promise<Book[]> {
        return await this.getBooks(`SELECT * FROM books WHERE genre = '${genre}'`, '@getBooksByGenre');
    }

    async getBooksByAuthor(author: string): Promise<Book[]> {
        return await this.getBooks(`SELECT * FROM books WHERE author = '${author}'`, '@getBooksByAuthor');
    }

    async removeBook(bookId: string): Promise<Book> {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE _id = ?', bookId)
            .catch(() => {
                throw new Error('database connection error@removeBook')
            });
        if (!result.length)
            throw new HttpError(404, `book with id '${bookId}' is not found`, '@removeBook');
        if (result[0].status === BookStatus.ON_HAND)
            throw new HttpError(409, `book with id '${bookId}' is on hand and can't be removed`, '@removeBook');
        if (result[0].status === BookStatus.IN_STOCK) {
            await pool.query('UPDATE books SET status = ? WHERE _id = ?', [BookStatus.REMOVED, bookId])
                .then(() => {
                    result[0].status = BookStatus.REMOVED;
                })
                .catch(() => {
                    throw new Error('database connection error@removeBook')
                });
        } else
            await pool.query('DELETE FROM books WHERE _id = ?', bookId)
                .then(() => {
                    result[0].status = BookStatus.DELETED;
                })
                .catch(() => {
                    throw new Error('database connection error@removeBook')
                })
        const pickList = await this.formPickList(bookId)
        const book = {...result[0], pickList: [...pickList]};
        return Promise.resolve(book as Book);
    }

    async editBook(editData: BookEdit): Promise<Book> {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE _id = ?', editData._id)
            .catch(() => {
                throw new Error('database connection error@removeBook')
            });
        if (!result.length)
            throw new HttpError(404, `book with id '${editData._id}' is not found`, '@editBook');
        if (result[0].status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${editData._id}' is removed and can't be edited`, '@editBook');
        await pool.query('UPDATE books SET title = ?, author = ?, genre = ?, year = ? WHERE _id = ?',
            [editData.title || result[0].title, editData.author || result[0].author
                , editData.genre || result[0].genre, editData.year || result[0].year, editData._id])
            .then(() => {
                result[0].title = editData.title || result[0].title;
                result[0].author = editData.author || result[0].author;
                result[0].genre = editData.genre || result[0].genre;
                result[0].year = editData.year || result[0].year;
            })
            .catch(() => {
                throw new Error('database connection error@editBook')
            });
        const pickList = await this.formPickList(editData._id)
        const book = {...result[0], pickList: [...pickList]};
        return Promise.resolve(book as Book);
    };

    async restoreBook(bookId: string): Promise<Book> {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE _id = ?', bookId)
            .catch(() => {
                throw new Error('database connection error@removeBook')
            });
        if (!result.length)
            throw new HttpError(404, `book with id '${bookId}' is not found`, '@restoreBook');
        if (result[0].status !== BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${bookId}' is not removed and can't be restored`, '@restoreBook');
        await pool.query('UPDATE books SET status = ? WHERE _id = ?', [BookStatus.IN_STOCK, bookId])
            .then(() => {
                result[0].status = BookStatus.IN_STOCK;
            })
            .catch(() => {
                throw new Error('database connection error@restoreBook');
            });
        const pickList = await this.formPickList(bookId)
        const book = {...result[0], pickList: [...pickList]};
        return Promise.resolve(book as Book);
    }

    async pickBook(bookId: string, readerId: number, readerName: string): Promise<Book> {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE _id = ?', bookId)
            .catch(() => {
                throw new Error('database connection error@removeBook')
            });
        if (!result.length)
            throw new HttpError(404, `book with id '${bookId}' is not found`, '@pickBook');
        if (result[0].status === BookStatus.ON_HAND)
            throw new HttpError(409, `book with id '${bookId}' is on hand and can't be picked`, '@pickBook');
        if (result[0].status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${bookId}' is removed and can't be picked`, '@pickBook');
        await pool.query('UPDATE books SET status = ? WHERE _id = ?', [BookStatus.ON_HAND, bookId])
            .catch(() => {
                throw new Error('database connection error@pickBook')
            });
        await pool.query('INSERT IGNORE INTO readers VALUES(?,?)',
            [readerId, readerName])
            .catch(() => {
                throw new Error('database connection error@pickBook')
            });
        await pool.query('INSERT INTO books_readers VALUES(?,?,?,?)',
            [bookId, readerId, new Date().toISOString(), null])
            .catch(() => {
                throw new Error('database connection error@pickBook')
            });
        const pickList = await this.formPickList(bookId)
        const book = {...result[0], pickList: [...pickList], status: BookStatus.ON_HAND};
        return Promise.resolve(book as Book);
    }

    async returnBook(bookId: string): Promise<Book> {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE _id = ?', bookId)
            .catch(() => {
                throw new Error('database connection error@removeBook')
            });
        if (!result.length)
            throw new HttpError(404, `book with id '${bookId}' is not found`, '@returnBook');
        if (result[0].status === BookStatus.IN_STOCK)
            throw new HttpError(409, `book with id '${bookId}' is in stock and can't be returned`, '@returnBook');
        if (result[0].status === BookStatus.REMOVED)
            throw new HttpError(409, `book with id '${bookId}' is removed and can't be returned`, '@returnBook');
        const [update] = await pool.query<ResultSetHeader>('UPDATE books_readers SET returnDate = ? WHERE _id = ? AND returnDate IS NULL ',
            [new Date().toISOString(), bookId])
            .catch(() => {
                throw new Error('database connection error@returnBook');
            });
        if(!update.affectedRows)
            throw new HttpError(404, `pick record for book with id '${bookId}' is not found`, '@returnBook');
        await pool.query('UPDATE books SET status = ? WHERE _id = ?', [BookStatus.IN_STOCK, bookId])
            .catch(() => {
                throw new Error('database connection error@returnBook')
            });
        const pickList = await this.formPickList(bookId)
        const book = {...result[0], pickList: [...pickList], status: BookStatus.IN_STOCK};
        return Promise.resolve(book as Book);
    }
}

export const bookServiceSql = new BookServiceImpSql();