import {Book, BookEdit, BookLite} from "../model/book.js";

export interface BookService{
    getAllBooks: (excess: boolean) => Promise<Book[] | BookLite[]>;
    getBooksByGenre: (genre: string, excess: boolean) => Promise<Book[] | BookLite[]>;
    getBooksByAuthor: (author: string, excess: boolean) => Promise<Book[] | BookLite[]>;
    addBook: (book: Book) => Promise<void>;
    editBook: (data: BookEdit) => Promise<Book>;
    removeBook: (bookId: string) => Promise<Book>;
    restoreBook: (bookId: string) => Promise<Book>;
    pickBook: (bookId: string, readerId:number) => Promise<void>;
    returnBook: (bookId: string) => Promise<void>;
}