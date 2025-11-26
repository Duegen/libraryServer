
export type ReaderDto = {
    readerId: number;
    userName: string;
    email: string;
    password: string;
    birthDate: string;
}

export type UpdateReaderDTO ={
    userName?: string;
    email?: string;
    birthDate?: string;
}

export type Reader = {
    _id: number;
    userName: string;
    email: string;
    passHash: string;
    birthDate: string;
}