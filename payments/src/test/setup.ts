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
    var signIn: (id?: string) => string[];
}

jest.mock('../nats-wrapper');
process.env.STRIPE_KEY = 'sk_test_51Jdc9qBrgaCPV6Rr9BZD0U7sl537exBqj3vMn7Dz36MBdQKUXXQZ1xWGuQW8LpXkxhKlhVAJpLHBYNH0UCWY89ck00bEfXu7aY';
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

global.signIn = (id?: string) => {
    // Build a JWT payload. { id, email }
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
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