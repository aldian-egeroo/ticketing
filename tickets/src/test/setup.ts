import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// declare global {
//    namespace NodeJS {
//        interface Global {
//            signIn(): Promise<string[]>
//        }
//    }
// }

declare global {
    var signIn: () => string[];
}

jest.mock('../nats-wrapper');
let mongo: any;
beforeAll(async () =>{
    process.env.JWT_KEY = 'test aja';
    mongo = await MongoMemoryServer.create();
    const mongoUrl = mongo.getUri();

    await mongoose.connect(mongoUrl, {});

})

beforeEach(async () => {
    jest.clearAllMocks();
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

global.signIn = () => {
    // Build a JWT payload. { id, email }
    const id = new mongoose.Types.ObjectId().toHexString();
    const payload = {
        id,
        email: 'test@test.id'
    };

    // create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return that string
    return [`session=${base64}`];
};