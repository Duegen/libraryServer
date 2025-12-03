import {Role} from "../utils/libTypes.js";

export const PORT = process.env.PORT || 3050;

export const skipRoutesArr = [
    "POST/account"
]

export const pathRoles: {[index: string]: string[]} = {
    'GET/account/byId': [Role.ADMIN, Role.SUPERVISOR, Role.READER, Role.LIBRARIAN],
    'PATCH/account/password': [Role.READER, Role.ADMIN, Role.LIBRARIAN, Role.SUPERVISOR],
    'DELETE/account': [Role.ADMIN, Role.SUPERVISOR],
    'PATCH/account/update' : [Role.ADMIN, Role.SUPERVISOR,  Role.READER, Role.LIBRARIAN],
    'PATCH/account/roles': [Role.ADMIN, Role.SUPERVISOR],
    'GET/api/books': [Role.READER, Role.LIBRARIAN],
    'GET/api/books/genres/': [Role.READER, Role.LIBRARIAN],
    'GET/api/books/authors/': [Role.READER, Role.LIBRARIAN],
    'POST/api/books': [Role.LIBRARIAN],
    'DELETE/api/books': [Role.LIBRARIAN],
    'PATCH/api/books': [Role.LIBRARIAN],
    'PATCH/api/books/restore': [Role.LIBRARIAN],
    'PATCH/api/books/pick': [Role.LIBRARIAN],
    'PATCH/api/books/return': [Role.LIBRARIAN],
    'GET/api/logger': [Role.ADMIN, Role.SUPERVISOR],
    'GET/api/logger/dates': [Role.ADMIN, Role.SUPERVISOR],
}