import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {app} from "../app";
import request from "supertest";

// declare global {
//    namespace NodeJS {
//        interface Global {
//            signIn(): Promise<string[]>
//        }
//    }
// }

declare global {
    var signIn: () => Promise<string[]>;
}

let mongo: any;
beforeAll(async () =>{
    process.env.JWT_KEY = 'test aja';
    mongo = await MongoMemoryServer.create();
    const mongoUrl = mongo.getUri();

    await mongoose.connect(mongoUrl, {});

})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections){
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signIn = async () => {
    const email = 'test@test.id';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({email, password})
        .expect(201);
    return response.get('Set-Cookie');
};