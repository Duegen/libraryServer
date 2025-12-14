import dotenv from "dotenv";
import {sqlConnect} from "./bookDatabaseSqlConnect.js";
import {bookMongoShema, mongoConnect} from "./databaseMongoConnect.js";
import {bookServiceSql} from "../service/BookServiceImpSql.js";
import {bookServiceMongo} from "../service/BookServiceImpMongo.js";
import {JSONConnect} from "./booksDatabaseJSONConnect.js";
import {bookServiceJSON} from "../service/BookServiceImpJSON.js";
import {config} from "../configuration/appConfig.js";

dotenv.config({quiet: true});

let connectFunc;
let service;
let db;

//database modes:
//SQL - sql database
//MONGO - mongo database
//NODE_JSON - Node JSON database

switch (config.database_mode){
    case 'SQL':{
        connectFunc = sqlConnect;
        service = bookServiceSql;
        db = '<SQL>'
        break;
    }
    case 'MONGO':{
        connectFunc = () => mongoConnect(process.env.MONGO_CLUSTER || '',
            process.env.MONGO_DATABASE || '', process.env.BOOKS_MONGO_COLLECTION || '', bookMongoShema)
        service = bookServiceMongo;
        db = '<MongoDB>'
        break;
    }
    case 'NODE_JSON':{
        connectFunc = JSONConnect
        service = bookServiceJSON;
        db = '<NODE_JSON>'
        break;
    }
    default:{
        connectFunc = JSONConnect
        service = bookServiceJSON;
        db = '<NODE_JSON>'
    }
}

export const booksDatabaseConnect = connectFunc;
export const bookService = service;
export const bookDb = db;