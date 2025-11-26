import {model, Schema} from "mongoose";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {v4 as uuidv4} from 'uuid';

const pickListSchema = new mongoose.Schema({
    readerId: {type: Number, min: 1, max: 999999999, required: true},
    readerName: {type: String, required: true},
    pickDate: {type: String, required: true},
    returnDate: {type: String, default: null}
}, {
    _id: false
});

export const bookMongoShema = new Schema({
    _id: {type: String, default: () => uuidv4(), unique: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    genre: {type: String, required: true},
    year: {type: Number, required: true},
    status: {type: String, required: true},
    pickList: {type: [pickListSchema], default: []},
    quantity: {type: Number, required: false},
}, {
    versionKey: false,
})

export const accountMongoSchema = new Schema({
    _id: {type: Number, min: 1, max: 999999999, unique: true},
    userName: {type: String, required: true},
    email: {type: String, required: true},
    passHash: {type: String, required: true},
    birthDate: {type: String, required: true},
},{
    versionKey: false,
})

export async function mongoConnect(mongoCluster: string, mongoDatabase: string, mongoCollection: string, mongoShema: mongoose.Schema) {
    try {
        dotenv.config({quiet: true});
        if(!mongoose.connection.readyState)
            await mongoose.connect(mongoCluster + mongoDatabase)
        if(mongoose.connection.name !== mongoDatabase)
            throw new Error('database connection error');
        return Promise.resolve(model(mongoCollection, mongoShema, mongoCollection));
    } catch (e) {
        return Promise.reject(e);
    }
}