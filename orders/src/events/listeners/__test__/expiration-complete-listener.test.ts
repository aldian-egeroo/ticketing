import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {Order} from "../../../models/order";
import {ExpirationCompletedEvent, OrderStatus} from "@ege.roo/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'new',
        price: 10,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const order = Order.build({
        expiresAt: new Date(),
        status: OrderStatus.Created,
        ticket,
        userId: "123"
    })
    await order.save();

    const data: ExpirationCompletedEvent["data"] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, msg, data };
}

it('update the order status to cancel', async () => {
    const {listener ,msg , data} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.orderId);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('emit on OrderCancelled event', async () => {
    const {listener, order ,msg , data} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);

});

it('ack the message', async () => {
    const {listener ,msg , data} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
