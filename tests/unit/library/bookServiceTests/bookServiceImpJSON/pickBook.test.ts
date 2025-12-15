jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        getIndex: jest.fn(),
        getData: jest.fn(),
        push: jest.fn(),
    },
}));

import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";
import {booksDatabase} from "../../../../../src/app.js";
import {BookStatus} from "../../../../../src/model/book.js";
import {JsonDB} from "node-json-db";

describe('BookServiceImpJSON.pickBook', () => {
    const service = new BookServiceImpJSON()
    const bookId = 'bookId', readerName = 'readerName', readerId = 12345;
    const database = booksDatabase as JsonDB;
    const book = {
        _id: bookId,
        pickList: []
    }

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: book not found', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(-1);
        await expect(service.pickBook(bookId, readerId, readerName))
            .rejects.toThrow(`book with id ${bookId} is not found`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })

    test('failed test: book is removed', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book,  status: BookStatus.REMOVED});
        await expect(service.pickBook(bookId, readerId, readerName))
            .rejects.toThrow(`book with id ${bookId} is removed and can't be picked`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })

    test('failed test: book is on hand', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book,  status: BookStatus.ON_HAND});
        await expect(service.pickBook(bookId, readerId, readerName))
            .rejects.toThrow(`book with id ${bookId} is already on hand`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })

    test('passed test: book is picked', async () => {
        const pickRecord = {
            readerId: readerId,
            readerName: readerName,
            pickDate: new Date().toLocaleDateString(),
            returnDate: null
        };
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book,  status: BookStatus.IN_STOCK});
        (database.push as jest.Mock).mockResolvedValue(undefined);
        const result = await service.pickBook(bookId, readerId, readerName);
        expect(result).toEqual({
            ...book,
            status: BookStatus.ON_HAND,
            pickList: [pickRecord],
        })
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })
})