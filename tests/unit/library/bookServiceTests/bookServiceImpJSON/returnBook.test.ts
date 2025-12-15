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

describe('BookServiceImpMongo.returnBook', () => {
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
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is not found`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
    })

    test('failed test: book is removed', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book, status: BookStatus.REMOVED});
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is removed and can't be returned`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
        expect(database.getData).toHaveBeenCalledWith(`/books[${0}]`)
    })

    test('failed test: book is in stock', async () => {
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book, status: BookStatus.IN_STOCK});
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`book with id '${bookId}' is not on hand and can't be returned`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
        expect(database.getData).toHaveBeenCalledWith(`/books[${0}]`)
    })

    test('failed test: pick record not found', async () => {
        const pickRecord = {
            pickList: [{
                readerId: 12345,
                readerName: 'readerName',
                pickDate: '14.12.2025',
                returnDate: '14.12.2025'
            }]
        };
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book, status: BookStatus.ON_HAND, ...pickRecord});
        await expect(service.returnBook(bookId))
            .rejects.toThrow(`pick record for book with id '${bookId}' is not found`);
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
        expect(database.getData).toHaveBeenCalledWith(`/books[${0}]`)
    })

    test('passed test: book is returned', async () => {
        const pickRecord = {
            pickList: [{
                readerId: 12345,
                readerName: 'readerName',
                pickDate: '14.12.2025',
                returnDate: null
            }]
        };
        (database.getIndex as jest.Mock).mockResolvedValue(0);
        (database.getData as jest.Mock).mockResolvedValue({...book, status: BookStatus.ON_HAND, ...pickRecord});
        (database.push as jest.Mock).mockResolvedValue(undefined);
        const result = await service.returnBook(bookId);
        expect(result).toEqual({
            ...book,
            status: BookStatus.IN_STOCK,
            pickList: [{
                readerId: 12345,
                readerName: 'readerName',
                pickDate: '14.12.2025',
                returnDate: new Date().toLocaleDateString()
            }],
        });
        expect(database.getIndex).toHaveBeenCalledWith('/books', bookId, '_id');
        expect(database.getData).toHaveBeenCalledWith(`/books[${0}]`);
        expect(database.push).toHaveBeenCalledWith(`/books[${0}]`,
            {...book, ...pickRecord, status: BookStatus.IN_STOCK});
    })
})