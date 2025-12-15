jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        getData: jest.fn(),
    },
}));

import {JsonDB} from "node-json-db";
import {booksDatabase} from "../../../../../src/app.js";
import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";

describe('BookServiceImpJSON.getAllBooks', () => {
    const service = new BookServiceImpJSON()
    const books = [{
        _id: 'bookId',
    }];
    const database = booksDatabase as JsonDB;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('passed test: all books are responsed', async () => {
        (database.getData as jest.Mock).mockResolvedValue(books);
        await expect(service.getAllBooks()).resolves.toEqual(books);
        expect(database.getData).toHaveBeenCalledWith('/books');
    })
})