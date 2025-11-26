import {BookService} from "./iBookService.js";
import {Book, BookEdit, BookStatus} from "../model/book.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {RowDataPacket} from "mysql2";
import {booksDatabase} from "../app.js";
import {Pool} from "mysql2/promise";

export class BookServiceImpSql implements BookService {
    async addBook(book: Book): Promise<void> {
        const pool = booksDatabase as Pool;
        await pool.query(`INSERT INTO books VALUES(?,?,?,?,?,?)`,
            [book._id, book.title, book.author, book.genre, book.status, book.year])
            .catch(() => {
                throw new Error('database connection error@addBook')
            })
    }

    async formPickList(bookId: string) {
        const pool = booksDatabase as Pool;
        const [result] = await pool.query<RowDataPacket[]>
        ('SELECT * FROM books_readers INNER JOIN readers ' +
            'ON books_readers.readerId=readers.readerId AND books_readers.bookId=?', bookId)
            .catch(() => {
                throw new Error('database connection error')
            })
        return Promise.resolve(result.map(unit => {
            delete unit.bookId
            return unit;
        }));
    }

    async getBook(query: string, source: string) {
        const pool = booksDatabase as Pool;
        const result = await pool.query<RowDataPacket[]>(query).then(async data => {
            const [result] = data;
            return result.map(async book => {
                book = {...book, pickList: []};
                const pickList = await this.formPickList(book.bookId)
                book.pickList.push(...pickList);
                return book;
            })
        }).catch((err) => {
            if(err instanceof HttpError) throw new HttpError(409, err.message, source);
            else throw new Error(err.message);
        })
        return Promise.resolve(await Promise.all(result) as Book[]);
    }

    async getAllBooks(): Promise<Book[]> {
        return await this.getBook('SELECT * FROM books', '@getAllBooks');
    }

    async getBooksByGenre(genre: string): Promise<Book[]> {
        return await this.getBook(`SELECT * FROM books WHERE genre = '${genre}'`, '@getBooksByGenre');
    }

    async getBooksByAuthor(author: string): Promise<Book[]> {
        return await this.getBook(`SELECT * FROM books WHERE author = '${author}'`, '@getBooksByAuthor');
    }

    async removeBook(bookId: string): Promise<Book> {
        const pool = booksDatabase as Pool;
        const result = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE bookId = ?', bookId).then(async data => {
            const [result] = data;
            if (result.length) {
                if (result[0].status === BookStatus.ON_HAND)
                    throw new HttpError(409, `book with id ${bookId} is on hand and can't be removed`, '@removeBook');
                if (result[0].status === BookStatus.IN_STOCK) {
                    await pool.query('UPDATE books SET status = ? WHERE bookId = ?', [BookStatus.REMOVED, bookId])
                        .then(() => {
                            result[0].status = BookStatus.REMOVED;
                        })
                        .catch(() => {
                            throw new Error('database connection error@removeBook')
                        });
                } else
                    await pool.query('DELETE FROM books WHERE bookId = ?', [bookId])
                        .then(() => {
                            result[0].status = BookStatus.DELETED;
                        })
                        .catch(() => {
                            throw new Error('database connection error@removeBook')
                        })
            } else
                throw new HttpError(409, `book with id ${bookId} is not found`, '@removeBook');
            return Promise.resolve(result[0] as Book);
        })
        const pickList = await this.formPickList(bookId)
        const book = {...result, pickList: [...pickList]};
        return Promise.resolve(book as Book);
    }

    async editBook(editData: BookEdit): Promise<Book>{
        const pool = booksDatabase as Pool;
        const result = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE bookId = ?', editData._id)
            .then(async data => {
            const [result] = data;
            if (result.length) {
                if (result[0].status === BookStatus.REMOVED)
                    throw new HttpError(409, `book with id ${editData._id} is removed and can't be edited`, '@editBook');
                await pool.query('UPDATE books SET title = ?, author = ?, genre = ?, year = ? WHERE bookId = ?',
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
            } else
                throw new HttpError(409, `book with id ${editData._id} is not found`, '@editBook');
            return Promise.resolve(result[0] as Book);
        })
        const pickList = await this.formPickList(editData._id)
        const book = {...result, pickList: [...pickList]};
        return Promise.resolve(book as Book);
    };

    async restoreBook(bookId: string): Promise<Book> {
        const pool = booksDatabase as Pool;
        const result = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE bookId = ?', bookId).then(async data => {
            const [result] = data;
            if (result.length) {
                if (result[0].status !== BookStatus.REMOVED)
                    throw new HttpError(409, `book with id ${bookId} is not removed and can't be restored`, '@restoreBook');
                await pool.query('UPDATE books SET status = ? WHERE bookId = ?', [BookStatus.IN_STOCK, bookId])
                    .then(() => {
                        result[0].status = BookStatus.IN_STOCK;
                    })
                    .catch(() => {
                        throw new Error('database connection error@restoreBook');
                    });
            } else
                throw new HttpError(409, `book with id ${bookId} is not found`,  '@restoreBook');
            return Promise.resolve(result[0] as Book);
        });
        const pickList = await this.formPickList(bookId)
        const book = {...result, pickList: [...pickList]};
        return Promise.resolve(book as Book);
    }

    async pickBook(bookId: string, readerName: string, readerId: number): Promise<void> {
        const pool = booksDatabase as Pool;
        await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE bookId = ?', bookId).then(async data => {
            const [result] = data;
            if (result.length) {
                if (result[0].status === BookStatus.ON_HAND)
                    throw new HttpError(409, `book with id ${bookId} is already on hand`, '@pickBook');
                if (result[0].status === BookStatus.REMOVED)
                    throw new HttpError(409, `book with id ${bookId} is already removed and can't be picked`, '@pickBook');
                await pool.query('UPDATE books SET status = ? WHERE bookId = ?', [BookStatus.ON_HAND, bookId])
                    .catch(() => {
                        throw new Error('database connection error@pickBook')
                    });
                await pool.query('INSERT INTO readers VALUES(?,?) ON DUPLICATE KEY UPDATE readerName=?',
                    [readerId, readerName, readerName])
                    .catch(() => {
                        throw new Error('database connection error@pickBook')
                    });
                await pool.query('INSERT INTO books_readers VALUES(?,?,?,?)',
                    [bookId, readerId, new Date().toISOString(), null])
                    .catch(() => {
                        throw new Error('database connection error@pickBook')
                    });
            } else
                throw new HttpError(409, `book with id ${bookId} is not found`, '@pickBook');
        });
    }

    async returnBook(bookId: string): Promise<void> {
        const pool = booksDatabase as Pool;
        await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE bookId = ?', bookId).then(async data => {
            const [result] = data;
            if (result.length) {
                if (result[0].status === BookStatus.IN_STOCK)
                    throw new HttpError(409, `book with id ${bookId} is already in stock and can't be returned`, '@returnBook');
                if (result[0].status === BookStatus.REMOVED)
                    throw new HttpError(409, `book with id ${bookId} is already removed and can't be returned`, '@returnBook');
                await pool.query('UPDATE books SET status = ? WHERE bookId = ?', [BookStatus.IN_STOCK, bookId])
                    .catch(() => {
                        throw new Error('database connection error@returnBook')
                    });
                await pool.query('UPDATE books_readers SET returnDate = ? WHERE bookId = ? AND returnDate IS NULL ',
                    [new Date().toISOString(), bookId])
                    .catch(() => {
                        throw new Error('database connection error@returnBook');
                    });
            } else
                throw new HttpError(409, `book with id ${bookId} is not found`, '@returnBook');
        });
    }
}

export const bookServiceSql = new BookServiceImpSql();