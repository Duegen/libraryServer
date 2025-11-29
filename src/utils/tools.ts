import {Book, BookDto, BookGenres, BookStatus} from "../model/book.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {v4 as uuidv4} from 'uuid';
import {User, UserDto} from "../model/user.js";
import bcrypt from 'bcryptjs';
import {Role} from "./libTypes.js";

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
        roles: [Role.READER],
    }
    return reader;
}