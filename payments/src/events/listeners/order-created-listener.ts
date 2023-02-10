import {Listener, OrderCreatedEvent, Subjects} from "@ege.roo/common";
import {Message} from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import {Order} from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const order = Order.build({
            id: data.orderId,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        })
        await order.save();

        msg.ack();
    }

    queueGroupName = queueGroupName;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

}