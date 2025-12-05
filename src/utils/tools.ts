import {Book, BookDto, BookGenres, BookLite, BookStatus} from "../model/book.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {v4 as uuidv4} from 'uuid';
import {User, UserDto} from "../model/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {config} from "../configuration/appConfig.js";

export function getGenre(genre: string){
    const gen = Object.values(BookGenres).find(value => value === genre)
    if(!gen) throw new HttpError(400, "Wrong genre", '@getGenre');
    return gen;
}

export const convertBookDtoToBook = (dto: BookDto): Book => {
    return {
        author: dto.author,
        genre: getGenre(dto.genre),
        _id: uuidv4(),
        pickList: [],
        status: BookStatus.IN_STOCK,
        title: dto.title,
        year: dto.year,
    }
}

export const convertUserDTOToUser = (readerDto: UserDto) => {
    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(readerDto.password, salt);
    const reader:User = {
        _id: readerDto.userId,
        birthDate: readerDto.birthDate,
        email: readerDto.email,
        passHash: passHash,
        userName: readerDto.userName,
        roles: config.default_roles,
    }
    return reader;
}

export const convertBooksToBooksLite = (books: Book[]): BookLite[] => {
    const booksLite: BookLite[] = [];
    books.forEach(book => {
        booksLite.push({
            author: book.author,
            genre: book.genre,
            status: BookStatus.IN_STOCK,
            title: book.title,
            year: book.year,
        });
    })
    return booksLite
}

export const getJWT = (userId: number, roles: string[]) => {
    const payload = {roles: JSON.stringify(roles)};
    const secret = process.env.JWT_SECRET || '';
    const options = {
        expiresIn: process.env.JWT_EXP as any || '1h',
        subject: userId.toString(),
    }
    return jwt.sign(payload, secret, options);
}

export const getAccessLevel = (roles: string[]) => {
    let accessLevel = 0;
    roles.forEach(role => {
        if(config.access_roles[role] > accessLevel) accessLevel = config.access_roles[role];
    })
    return accessLevel;
}