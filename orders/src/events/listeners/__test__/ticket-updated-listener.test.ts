import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {TicketUpdatedEvent} from "@ege.roo/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    })
    await ticket.save();

    // create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        price: 15,
        title: 'new concert',
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    // create a msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    // return all of this stuff
    return { listener, data, msg , ticket };
};

it('finds, updates, and save a ticket', async () => {
    const {msg, listener, data, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});
it('ack the message', async () => {
    const {msg, listener, data, ticket } = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('not call ack if the event has a skipped version number', async () => {
    const {msg, listener, data, ticket } = await setup();

    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (err){

    }
    expect(msg.ack).not.toHaveBeenCalled();
});