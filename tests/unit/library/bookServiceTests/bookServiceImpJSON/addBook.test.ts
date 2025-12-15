jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        getIndex: jest.fn(),
        push: jest.fn(),
    },
}));

import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";
import {JsonDB} from "node-json-db";
import {booksDatabase} from "../../../../../src/app.js";
import {Book} from "../../../../../src/model/book.js";

describe('BookServiceImpJSON.addBook', () => {
    const service = new BookServiceImpJSON();
    const book = {
        _id: 'bookId',
    }
    const database = booksDatabase as JsonDB;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: duplicated bookId', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        await expect(service.addBook(book as Book)).rejects.toThrow(`duplicated bookId '${book._id}', book not added`)
        expect(database.getIndex).toHaveBeenCalledWith('/books', book._id!, '_id');
    })

    test('passed test: book is added', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(-1);
        (database.push as jest.Mock).mockResolvedValue(null);
        await expect(service.addBook(book as Book)).resolves.toBeUndefined();
        expect(database.push).toHaveBeenCalledWith(`/books[]`, book);
        expect(database.getIndex).toHaveBeenCalledWith('/books', book._id!, '_id');
    })
})