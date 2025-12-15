jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        getIndex: jest.fn(),
        push: jest.fn(),
        getData: jest.fn(),
    },
}));

import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";
import {booksDatabase} from "../../../../../src/app.js";
import {BookStatus} from "../../../../../src/model/book.js";
import {JsonDB} from "node-json-db";

describe('BookServiceImpJSON.editBook', () => {
    const service = new BookServiceImpJSON()
    const bookEditInfo = {
        _id: 'bookId',
        title: 'title2',
    };
    const book = {
        _id: 'bookId',
        title: 'bookTitle',
        author: 'author',
        genre: 'genre',
        year: 2000,
    }
    const database = booksDatabase as JsonDB;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(-1);
        await expect(service.editBook(bookEditInfo))
            .rejects.toThrow(`book with id '${bookEditInfo._id}' is not found`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', book._id!, '_id');
    })

    test('failed test: book is removed', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book, status: BookStatus.REMOVED});
        await expect(service.editBook(bookEditInfo))
            .rejects.toThrow(`book with id '${bookEditInfo._id}' is removed and can't be edited`)
        expect(database.getIndex).toHaveBeenCalledWith('/books', book._id!, '_id');
        expect(database.getData).toHaveBeenCalledWith(`/books[${0}]`)
    })

    test('passed test: book info is updated', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue(book);
        (database.push as jest.Mock).mockResolvedValue(null);
        const result = await service.editBook(bookEditInfo);
        expect(result).toEqual({...book, ...bookEditInfo});
        expect(database.getIndex).toHaveBeenCalledWith('/books', book._id!, '_id');
        expect(database.getData).toHaveBeenCalledWith(`/books[${0}]`)
        expect(database.push).toHaveBeenCalledWith(`/books[${0}]`, book)
    })
})