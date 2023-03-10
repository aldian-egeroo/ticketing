import Queue from "bull";
import {ExpirationCompletePublisher} from "../publishers/expiration-complete-publisher";
import {natsWrapper} from "../nats-wrapper";

interface Paylod {
    orderId: string;
}
const expirationQueue = new Queue<Paylod>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
    await new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
});

export {expirationQueue} ;