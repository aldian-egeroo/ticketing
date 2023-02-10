import {app} from "./app";
import * as mongoose from "mongoose";
import {natsWrapper} from "./nats-wrapper";
import { OrderCancelledListener} from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener} from "./events/listeners/order-created-listener";

const startApp = async () => {
    if (!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be set');
    }
    if (!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined.')
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined.');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined.');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined.');
    }
    if (!process.env.STRIPE_KEY) {
        throw new Error('STRIPE_KEY must be defined.')
    }
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // listening
        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderCreatedListener(natsWrapper.client).listen();

        mongoose.set("strictQuery", false);
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