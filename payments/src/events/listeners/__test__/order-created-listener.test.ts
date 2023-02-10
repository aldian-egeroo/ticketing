import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@ege.roo/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent["data"] = {
        expiresAt: "asdf",
        orderId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        ticket: {
            id: "asdf",
            price: 10
        },
        userId: "asdfas",
        version: 0
    }

    // @ts-ignore
    const msg:Message = {
        ack: jest.fn()
    }

    return {listener, msg, data};
}

it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.orderId)
    expect(order!.price).toEqual(data.ticket.price);

});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});