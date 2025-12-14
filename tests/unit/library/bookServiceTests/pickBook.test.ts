jest.mock('../../../../src/app.js', () => ({
    booksDatabase: {
        findById: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../src/app.js";
import {Book, BookStatus} from "../../../../src/model/book.js";

describe('BookServiceImpMongo.pickBook', () => {
    const service = new BookServiceImpMongo()
    const bookId = 'bookId', readerName = 'readerName', readerId = 12345;
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.findById as jest.Mock).mockResolvedValue(null);
        await expect(service.pickBook(bookId, readerId, readerName))
            .rejects.toThrow(`book with id ${bookId} is not found`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: book is removed', async () => {
        const book = {
            status: BookStatus.REMOVED
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.pickBook(bookId, readerId, readerName))
            .rejects.toThrow(`book with id ${bookId} is removed and can't be picked`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: book is on hand', async () => {
        const book = {
            status: BookStatus.ON_HAND
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.pickBook(bookId, readerId, readerName))
            .rejects.toThrow(`book with id ${bookId} is already on hand`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('passed test: book is picked', async () => {
        const book = {
            status: BookStatus.IN_STOCK,
            pickList: []
        };
        const mockSave = jest.fn().mockResolvedValue(undefined);
        (database.findById as jest.Mock).mockResolvedValue({...book, save: mockSave});
        await expect(service.pickBook(bookId, readerId, readerName)).resolves.toBeUndefined();
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })
})