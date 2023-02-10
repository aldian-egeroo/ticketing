import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledEvent, OrderStatus} from "@ege.roo/common";
import mongoose from "mongoose";
import {Order} from "../../../models/order";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Created,
        userId: "asdfas",
        version: 0
    });

    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        ticket: {
            id: "asdfas"
        },
        version: 1
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, msg, data };
};

it('updates the status of the order', async() => {
    const { listener, msg, data } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async() => {
    const { listener, msg, data } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});