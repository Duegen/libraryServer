jest.mock('../../../../src/app.js', () => ({
    booksDatabase: {
        findById: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../src/app.js";
import {Book, BookStatus} from "../../../../src/model/book.js";

describe('BookServiceImpMongo.returnBook', () => {
    const service = new BookServiceImpMongo()
    const bookId = 'bookId';
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.findById as jest.Mock).mockResolvedValue(null);
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`book with id ${bookId} is not found`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: book is removed', async () => {
        const book = {
            status: BookStatus.REMOVED
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is removed and can't be returned`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: book is in stock', async () => {
        const book = {
            status: BookStatus.IN_STOCK
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is not on hand and can't be returned`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('failed test: pick record not found', async () => {
        const book = {
            status: BookStatus.ON_HAND,
            pickList: [{
                readerId: 12345,
                readerName: 'readerName',
                pickDate: '14.12.2025',
                returnDate: '14.12.2025'
            }]
        };
        (database.findById as jest.Mock).mockResolvedValue(book);
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`pick record for book with id '${bookId}' is not found`);
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })

    test('passed test: book is returned', async () => {
        const book = {
            status: BookStatus.ON_HAND,
            pickList: [{
                readerId: 12345,
                readerName: 'readerName',
                pickDate: '14.12.2025',
                returnDate: null
            }]
        };
        const mockSave = jest.fn().mockResolvedValue(undefined);
        (database.findById as jest.Mock).mockResolvedValue({...book, save: mockSave});
        await expect(service.returnBook(bookId)).resolves.toBeUndefined();
        expect(database.findById).toHaveBeenCalledWith(bookId);
    })
})