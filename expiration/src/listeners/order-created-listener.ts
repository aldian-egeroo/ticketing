import {Listener, OrderCreatedEvent, Subjects} from "@ege.roo/common";
import {Message} from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import {expirationQueue} from "../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        console.log('waiting this many milliseconds to process', delay);

        await expirationQueue.add({
            orderId: data.orderId
        }, {
            delay
        });

        msg.ack();
    }

    queueGroupName = queueGroupName;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

}