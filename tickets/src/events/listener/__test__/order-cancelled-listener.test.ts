import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCancelledEvent, OrderCreatedEvent} from "@ege.roo/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = Ticket.build({
        price: 10,
        title: "test",
        userId: "asdf",
    });
    const orderId = new mongoose.Types.ObjectId().toHexString();
    ticket.set({orderId: orderId});
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        ticket: {
            id: ticket.id
        },
        version: 0
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, ticket, data, msg};

}

it('updated the ticket, published an event and ack the message', async () => {
    const { listener, data, msg, ticket} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toBeUndefined();

    expect(msg.ack).toHaveBeenCalled();

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});