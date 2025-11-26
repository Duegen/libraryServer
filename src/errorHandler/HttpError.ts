
export class HttpError extends Error {
    constructor(public status: number, public message:string, public source:string) {
        super(message);
    }
}