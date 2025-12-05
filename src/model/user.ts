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
}

export type User = {
    _id: number;
    userName: string;
    email: string;
    passHash: string;
    birthDate: string;
    roles: string[];
}