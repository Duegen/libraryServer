import {User, UpdateUserDTO} from "../model/user.js";
import {Role} from "../utils/libTypes.js";

export interface AccountService {
    createAccount: (user: User) => Promise<void>;
    getAccountById: (userId: number) => Promise<User>;
    removeAccount: (userId: number) => Promise<User>;
    changePassword: (userId: number, oldPassword: string, newPassword: string) => Promise<void>;
    editAccount: (userId:number, newReaderData: UpdateUserDTO) => Promise<User>;
    setAccountRole: (userId: number, roles: Role[]) => Promise<User>;
}