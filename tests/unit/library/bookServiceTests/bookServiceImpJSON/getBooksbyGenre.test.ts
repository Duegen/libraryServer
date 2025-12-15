jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        count: jest.fn(),
        getData: jest.fn(),
    },
}));

import {JsonDB} from "node-json-db";
import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";
import {booksDatabase} from "../../../../../src/app.js";

describe('BookServiceImpJSON.getBooksByGenre', () => {
    const service = new BookServiceImpJSON()
    const genre = 'genre';
    const books = [{
        _id: 'bookId',
    }];
    const database = booksDatabase as JsonDB;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('passed test: books by genre are responsed', async () => {
        (database.count as jest.Mock).mockResolvedValue(1);
        (database.getData as jest.Mock).mockResolvedValueOnce(genre);
        (database.getData as jest.Mock).mockResolvedValueOnce(books[0]);
        await expect(service.getBooksByGenre(genre)).resolves.toEqual(books);
        expect(database.count).toHaveBeenCalledWith('/books');
        expect(database.getData).toHaveBeenNthCalledWith
            (1, '/books' + `[${0}]/` + 'genre')
        expect(database.getData).toHaveBeenNthCalledWith(2, '/books' + `[${0}]/`)
    })
})