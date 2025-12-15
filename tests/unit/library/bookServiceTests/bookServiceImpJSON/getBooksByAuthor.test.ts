jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        count: jest.fn(),
        getData: jest.fn(),
    },
}));

import {BookServiceImpJSON} from "../../../../../src/service/BookServiceImpJSON.ts";
import {booksDatabase} from "../../../../../src/app.js";
import {JsonDB} from "node-json-db";

describe('BookServiceImpJSON.getBooksByAuthor', () => {
    const service = new BookServiceImpJSON()
    const author = 'author';
    const books = [{
        _id: 'bookId',
    }];
    const database = booksDatabase as JsonDB;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('passed test: books by author are responsed', async () => {
        (database.count as jest.Mock).mockResolvedValue(1);
        (database.getData as jest.Mock).mockResolvedValueOnce(author);
        (database.getData as jest.Mock).mockResolvedValueOnce(books[0]);
        await expect(service.getBooksByAuthor(author)).resolves.toEqual(books);
        expect(database.count).toHaveBeenCalledWith('/books');
        expect(database.getData).toHaveBeenNthCalledWith
            (1, '/books' + `[${0}]/` + 'author')
        expect(database.getData).toHaveBeenNthCalledWith(2, '/books' + `[${0}]/`)
    })
})