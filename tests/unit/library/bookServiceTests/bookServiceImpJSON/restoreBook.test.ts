jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        getIndex: jest.fn(),
        getData: jest.fn(),
        push: jest.fn(),
    },
}));

import {JsonDB} from "node-json-db";
import {booksDatabase} from "../../../../../src/app.js";
import {BookStatus} from "../../../../../src/model/book.js";
import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";

describe('BookServiceImpJSON.restoreBook', () => {
    const service = new BookServiceImpJSON()
    const bookId = 'bookId';
    const database = booksDatabase as JsonDB;
    const book = {
        _id: bookId,
    }

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(-1);
        await expect(service.restoreBook(bookId))
            .rejects.toThrow(`book with id ${bookId} is not found`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })

    test('failed test: book is not removed', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book,  status: BookStatus.ON_HAND});
        await expect(service.restoreBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is not removed and can't be restored`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })

    test('passed test: book is restored', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book,  status: BookStatus.REMOVED});
        (database.push as jest.Mock).mockResolvedValue(undefined);
        const result = await service.restoreBook(bookId);
        expect(result).toEqual({...book,status: BookStatus.IN_STOCK});
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })
})