jest.mock('../../../../src/app.js', () => ({
    booksDatabase: {
        findById: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../src/app.js";
import {Book, BookStatus} from "../../../../src/model/book.js";

describe('BookServiceImpMongo.restoreBook', () => {
    const service = new BookServiceImpMongo()
    const bookId = 'bookId';
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.findById as jest.Mock).mockResolvedValue(null);
        await expect(service.restoreBook(bookId))
            .rejects.toThrow(`book with id ${bookId} is not found`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: book is not removed', async () => {
        const book = {
            status: BookStatus.ON_HAND
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.restoreBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is not removed and can't be restored`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('passed test: book is restored', async () => {
        const book = {
            status: BookStatus.REMOVED,
        };
        const mockSave = jest.fn().mockResolvedValue(undefined);
        (database.findById as jest.Mock).mockResolvedValue({...book, save: mockSave});
        const result = await service.restoreBook(bookId);
        expect(result).toEqual({status: BookStatus.IN_STOCK, save: mockSave});
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })
})