import {BookService} from "../service/iBookService.js";
import {Response} from "express";
import {Book, BookDto, BookEdit, BookLite, BookStatus} from "../model/book.js";
import {convertBookDtoToBook, convertBooksToBooksLite, getAccessLevel} from "../utils/tools.js";
import {loggerWinston} from "../winston/logger.js";
import {bookService} from "../database/booksDatabaseConfig.js";
import {AuthRequest} from "../utils/libTypes.js";
import {config} from "../configuration/appConfig.js";
import {AccountService} from "../service/iAccountService.js";
import {accountServiceMongo} from "../service/AccountServiceImpMongo.js";
import {HttpError} from "../errorHandler/HttpError.js";

export class BookController {
    private service: BookService = bookService;
    private accountService: AccountService = accountServiceMongo;

    addBook = async (req: AuthRequest, res: Response): Promise<void> => {
        const dto = req.body as BookDto;
        const book:Book = convertBookDtoToBook(dto);
        const result = await this.service.addBook(book);
        res.status(201).json(result);
        loggerWinston.info(`userId: ${req.userId}@book with id '${book._id}' is added@addBook`)
    }

    getAllBooks = async (req:AuthRequest, res: Response)=> {
        const books: Book[] = await this.service.getAllBooks();
        let result: Book[] | BookLite[] = [];
        getAccessLevel(req.roles!) >= config.get_books_info_level ? result = books : result = convertBooksToBooksLite(books);
        if(result.length){
            res.status(200).json(result);
            loggerWinston.info(`userId: ${req.userId}@all books are responsed@getAllBooks`);
        }else{
            res.status(200).send(`book list is empty@getAllBooks`);
            loggerWinston.error(`book list is empty@getAllBooks`);
        }
    }

    getBooksByGenre = async (req:AuthRequest, res: Response): Promise<void> => {
        const books: Book[] = await this.service.getAllBooks();
        let result: Book[] | BookLite[] = [];
        getAccessLevel(req.roles!) >= config.get_books_info_level ? result = books : result = convertBooksToBooksLite(books);
        if(result.length){
            res.status(200).json(result);
            loggerWinston.info(`userId: ${req.userId}@all books with genre '${req.params.genre}' are responsed@getBooksByGenre`)
        }else{
            res.status(200).send(`books with genre '${req.params.genre}' not found@getBooksByGenre`);
            loggerWinston.error(`books with genre '${req.params.genre}' not found@getBooksByGenre`)
        }
    }

    getBooksByAuthor = async (req:AuthRequest, res: Response): Promise<void> => {
        const books: Book[] = await this.service.getAllBooks();
        let result: Book[] | BookLite[] = [];
        getAccessLevel(req.roles!) >= config.get_books_info_level ? result = books : result = convertBooksToBooksLite(books);
        if(result.length){
            res.status(200).json(result);
            loggerWinston.info(`userId: ${req.userId}@all books with author '${req.params.author}' are responsed@getBooksByAuthor`)
        }else{
            res.status(200).send(`books with author '${req.params.author}' not found@getBooksByAuthor`);
            loggerWinston.error(`books with author '${req.params.author}' not found@getBooksByAuthor`)
        }
    }

    editBook = async (req:AuthRequest, res: Response): Promise<void> => {
        const body = req.body as BookEdit;
        const result = await this.service.editBook(body);
        res.status(200).json(result);
        loggerWinston.info(`userId: ${req.userId}@book with id '${body._id}' is edited@editBook`)
    }

    removeBook = async (req:AuthRequest, res: Response): Promise<void> => {
        const result = await this.service.removeBook(req.query.bookId + "");
        res.status(200).json(result);
        if(result.status === BookStatus.REMOVED)
            loggerWinston.info(`userId: ${req.userId}@book with id '${req.query.bookId}' is marked as removed@removeBook`)
        else
            loggerWinston.info(`userId: ${req.userId}@book with id '${req.query.bookId}' is deleted@removeBook`)
    }

    restoreBook = async (req:AuthRequest, res: Response): Promise<void> => {
        const result = await this.service.restoreBook(req.query.bookId + "");
        res.status(200).json(result);
        loggerWinston.info(`userId: ${req.userId}@book with id '${req.query.bookId}' is restored@restoreBook`)
    }

    pickBook =  async (req: AuthRequest, res: Response): Promise<void> => {
        const user = await this.accountService.getAccountById(+req.query.readerId!);
        if(!user.roles.some(role => config.pick_book_access.includes(role)))
            throw new HttpError(403,`user with roles ${user.roles} can't pick books`,'@pickBook')
        const result = await this.service.pickBook(req.query.bookId + "", user._id, user.userName);
        res.status(200).json(result);
        loggerWinston.info(`userId: ${req.userId}@book with id '${req.query.bookId}' is picked@pickBook`)
    }

    returnBook = async (req: AuthRequest, res: Response): Promise<void> => {
        const  result = await this.service.returnBook(req.query.bookId + "")
        res.status(200).json(result);
        loggerWinston.info(`userId: ${req.userId}@book with id '${req.query.id}' is returned@returnBook`)
    }
}

export const bookController =  new BookController();