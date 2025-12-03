import {Request} from 'express';

export interface AuthRequest extends  Request {
    userId?: number,
    userName?: string,
    roles?: Role[];
}

export enum Role {
    READER = 'reader',
    ADMIN = 'admin',
    LIBRARIAN = 'librarian',
    SUPERVISOR = 'supervisor',
}
