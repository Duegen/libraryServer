jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        findById: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../../src/app.js";
import {Book, BookStatus} from "../../../../../src/model/book.js";

describe('BookServiceImpMongo.removeBook', () => {
    const service = new BookServiceImpMongo()
    const bookId = 'bookId';
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.findById as jest.Mock).mockResolvedValue(null);
        await expect(service.removeBook(bookId))
            .rejects.toThrow(`book with id ${bookId} is not found`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: book is on hand', async () => {
        const book = {
            status: BookStatus.ON_HAND
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.removeBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is on hand and can't be removed`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('passed test: book is removed', async () => {
        const book = {
            status: BookStatus.IN_STOCK,
        };
        const mockSave = jest.fn().mockResolvedValue(undefined);
        (database.findById as jest.Mock).mockResolvedValue({...book, save: mockSave});
        const result = await service.removeBook(bookId);
        expect(result).toEqual({status: BookStatus.REMOVED, save: mockSave});
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('passed test: book is deleted', async () => {
        const book = {
            status: BookStatus.REMOVED,
        };
        const mockDeleteOne = jest.fn().mockResolvedValue(undefined);
        (database.findById as jest.Mock).mockResolvedValue({...book, deleteOne: mockDeleteOne});
        const result = await service.removeBook(bookId);
        expect(result).toEqual({status: BookStatus.DELETED, deleteOne: mockDeleteOne});
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })
})