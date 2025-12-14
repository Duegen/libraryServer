jest.mock('../../../../../src/app.js', () => ({
    booksDatabase: {
        find: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../../src/app.js";
import {Book} from "../../../../../src/model/book.js";

describe('BookServiceImpMongo.getBooksByAuthor', () => {
    const service = new BookServiceImpMongo()
    const author = 'author';
    const books = [{
        _id: 'bookId',
    }];
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('passed test: books by author are responsed', async () => {
        (database.find as jest.Mock).mockResolvedValue(books);
        await expect(service.getBooksByAuthor(author)).resolves.toEqual(books);
        expect(database.find).toHaveBeenCalledWith({author: author});
    })
})