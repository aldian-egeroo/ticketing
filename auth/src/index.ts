import {app} from "./app";
import * as mongoose from "mongoose";


const startApp = async () => {
    console.log('startup app...');
    if (!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be set');
    }
    if (!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connected to mongodb')
    }catch (e){
        console.log(e);
    }

    app.listen(3000, () => {
        console.log('listening auth in 3000!');
    });
}

startApp();