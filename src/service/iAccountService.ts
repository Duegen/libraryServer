import {User, UpdateUserDTO} from "../model/user.js";

export interface AccountService {
    createAccount: (reader: User) => Promise<void>;
    getAccountById: (id: number) => Promise<User>;
    removeAccount: (id: number) => Promise<User>;
    changePassword: (id: number, oldPassword: string, newPassword: string) => Promise<void>;
    editAccount: (id:number, newReaderData: UpdateUserDTO) => Promise<User>;
}