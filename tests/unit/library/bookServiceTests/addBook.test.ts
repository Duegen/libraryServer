jest.mock('../../../../src/app.js', () => ({
    booksDatabase: {
        findById: jest.fn(),
        create: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../src/app.js";
import {Book} from "../../../../src/model/book.js";

describe('BookServiceImpMongo.addBook', () => {
    const service = new BookServiceImpMongo()
    const book = {
        _id: 'bookId',
    }
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: duplicated bookId', async () => {
        (database.findById as jest.Mock).mockResolvedValue({_id: 'bookId'});
        await expect(service.addBook(book as Book)).rejects.toThrow(`duplicated bookId ${book._id}, book not added`)
        expect(database.findById).toHaveBeenCalledWith(book._id);
    })

    test('passed test: book is added', async () => {
        (database.findById as jest.Mock).mockResolvedValue(null);
        (database.create as jest.Mock).mockResolvedValue(null);
        const result = await service.addBook(book as Book);
        expect(result).toBeUndefined();
        expect(database.create).toHaveBeenCalledWith(book);
        expect(database.findById).toHaveBeenCalledWith(book._id);
    })
})