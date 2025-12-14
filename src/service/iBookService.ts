import {Book, BookEdit} from "../model/book.js";

export interface BookService{
    getAllBooks: () => Promise<Book[]>;
    getBooksByGenre: (genre: string) => Promise<Book[]>;
    getBooksByAuthor: (author: string) => Promise<Book[]>;
    addBook: (book: Book) => Promise<void>;
    editBook: (data: BookEdit) => Promise<Book>;
    removeBook: (bookId: string) => Promise<Book>;
    restoreBook: (bookId: string) => Promise<Book>;
    pickBook: (bookId: string, readerId:number, readerName: string) => Promise<Book>;
    returnBook: (bookId: string) => Promise<Book>;
}