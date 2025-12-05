import {Request} from 'express';

export interface AuthRequest extends  Request {
    userId?: number,
    userName?: string,
    roles?: string[];
    accessLevel?: number;
}