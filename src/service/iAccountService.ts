import {Reader, UpdateReaderDTO} from "../model/reader.js";

export interface AccountService {
    createAccount: (reader: Reader) => Promise<void>;
    getAccountById: (id: number) => Promise<Reader>;
    removeAccount: (id: number) => Promise<Reader>;
    changePassword: (id: number, newPassword: string) => Promise<void>;
    editAccount: (id:number, newReaderData: UpdateReaderDTO) => Promise<Reader>;
}