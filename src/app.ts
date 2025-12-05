import {launchServer} from "./server.js";
import {loggerWinston} from "./winston/logger.js";
import {Pool} from "mysql2/promise";
import mongoose from "mongoose";
import {bookDb, booksDatabaseConnect} from "./database/booksDatabaseConfig.js";
import {JsonDB} from "node-json-db";
import {accountMongoSchema, mongoConnect} from "./database/databaseMongoConnect.js";

const accountPromise = mongoConnect(process.env.MONGO_CLUSTER || '',
    process.env.MONGO_DATABASE || '', process.env.ACCOUNTS_MONGO_COLLECTION || '', accountMongoSchema)
    .then((data) => {
        loggerWinston.warn('Accounts database<MongoDB>: database is successfully connected');
        return data;
    })
    .catch(() => {
        loggerWinston.warn('Accounts database<MongoDB>: connection to database is failed');
        throw new Error('accounts database connection failed');
        //   process.exit(1)
    })

const booksPromise = booksDatabaseConnect().then(data => {
    loggerWinston.warn(`Books database${bookDb}: database is successfully connected`);
    return data;
}).catch((err) => {
    loggerWinston.warn("Books database: connection to database is failed");
    throw new Error('books database connection failed');
    //process.exit(1)
});

export let accountDatabase: mongoose.Model<any>;
export let booksDatabase: mongoose.Model<any> | Pool | JsonDB;

Promise.all([accountPromise, booksPromise]).then(([accountDtbs, bookDtbs]) => {
    accountDatabase =  accountDtbs;
    booksDatabase =  bookDtbs;
    launchServer()
        .then(() => {
            loggerWinston.warn("server is successfully started");
        }).catch((err) => {
        loggerWinston.warn("starting server is failed: " + err.message);
    })
}).catch((err) => {
    process.exit(1)
})




// export const accountDatabase: mongoose.Model<any> = await mongoConnect(process.env.MONGO_CLUSTER || '',
//     process.env.MONGO_DATABASE || '', process.env.ACCOUNTS_MONGO_COLLECTION || '', accountMongoSchema)
//     .then((data) => {
//         loggerWinston.warn('Accounts database<MongoDB>: database is successfully connected');
//         return data;
//     })
//     .catch(() => {
//         loggerWinston.warn('Accounts database<MongoDB>: connection to database is failed');
//         process.exit(1)
//     })
//
// export const booksDatabase: mongoose.Model<any> | Pool | JsonDB = await booksDatabaseConnect().then(data => {
//     loggerWinston.warn(`Books database${bookDb}: database is successfully connected`);
//     launchServer()
//         .then(() => {
//             loggerWinston.warn("server is successfully started");
//         }).catch((err) => {
//             loggerWinston.warn("starting server is failed: " + err.message);
//         })
//     return data;
// }).catch((err) => {
//     loggerWinston.warn("Books database: connection to database is failed");
//     process.exit(1)
// });
