import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCreatedEvent, OrderStatus, Subjects} from "@ege.roo/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save the ticket
    const ticket = Ticket.build({
        title: 'new',
        price: 1,
        userId: new mongoose.Types.ObjectId().toHexString()
    })

    await ticket.save();

    // create fake data event
    const data: OrderCreatedEvent['data'] = {
        expiresAt: "asdfas",
        orderId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
        version: 0,
        userId: "fsdfsd"

    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, ticket, msg, data};
}

it('sets the userId of the ticket', async () => {
    // call setup
    const {listener, ticket, msg, data} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.orderId);
});

it('acks the message', async () => {
    const {listener, msg, data} = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();

});

it('published a ticket updated event', async () => {
    const {listener, ticket, msg, data} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // @ts-ignore
    // console.log(natsWrapper.client.publish.mock.calls);
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.orderId).toEqual(ticketUpdatedData.orderId);
});