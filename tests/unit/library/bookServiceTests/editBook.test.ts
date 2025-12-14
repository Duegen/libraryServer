jest.mock('../../../../src/app.js', () => ({
    booksDatabase: {
        findById: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../src/app.js";
import {Book, BookStatus} from "../../../../src/model/book.js";

describe('BookServiceImpMongo.editBook', () => {
    const service = new BookServiceImpMongo()
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
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.findById as jest.Mock).mockResolvedValue(null);
        await expect(service.editBook(bookEditInfo))
            .rejects.toThrow(`book with id ${bookEditInfo._id} is not found`);
        expect(database.findById).toHaveBeenCalledWith(bookEditInfo._id);
    })

    test('failed test: book is removed', async () => {
        (database.findById as jest.Mock).mockResolvedValue({...book, status: BookStatus.REMOVED});
        await expect(service.editBook(bookEditInfo))
            .rejects.toThrow(`book with id '${bookEditInfo._id}' is removed and can't be edited`)
        expect(database.findById).toHaveBeenCalledWith(bookEditInfo._id);
    })

    test('passed test: book info is updated', async () => {
        const mockSave = jest.fn().mockResolvedValue(undefined);
        (database.findById as jest.Mock).mockResolvedValue({...book, save: mockSave});
        const result = {...await service.editBook(bookEditInfo)};
        expect(result).toEqual({...book, ...bookEditInfo, save: mockSave});
        expect(database.findById).toHaveBeenCalledWith(bookEditInfo._id);
    })
})