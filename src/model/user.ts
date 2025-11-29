import {Role} from "../utils/libTypes.js";

export type UserDto = {
    userId: number;
    userName: string;
    email: string;
    password: string;
    birthDate: string;
}

export type UpdateUserDTO ={
    userName?: string;
    email?: string;
    birthDate?: string;
    roles?: Role[];
}

export type User = {
    _id: number;
    userName: string;
    email: string;
    passHash: string;
    birthDate: string;
    roles: Role[];
}