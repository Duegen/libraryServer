jest.mock('../../../../src/app.js', () => ({
    booksDatabase: {
        find: jest.fn(),
    },
}));

import mongoose from "mongoose";
import {BookServiceImpMongo} from "../../../../src/service/BookServiceImpMongo.js";
import {booksDatabase} from "../../../../src/app.js";
import {Book} from "../../../../src/model/book.js";

describe('BookServiceImpMongo.getBooksByGenre', () => {
    const service = new BookServiceImpMongo()
    const genre = 'genre';
    const books = [{
        _id: 'bookId',
    }];
    const database = booksDatabase as mongoose.Model<Book>;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('passed test: books by genre are responsed', async () => {
        (database.find as jest.Mock).mockResolvedValue(books);
        await expect(service.getBooksByGenre(genre)).resolves.toEqual(books);
        expect(database.find).toHaveBeenCalledWith({genre: genre});
    })
})