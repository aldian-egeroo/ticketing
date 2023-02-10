import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@ege.roo/common";
import mongoose, {set} from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    // creates an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: "ticket",
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, msg };
}

it('creates and saves a ticket', async () => {

    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object * msg object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});
it('acks the message', async () => {

    const {listener, data, msg} = await setup();

    // call the onMessage function with the data object * msg object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ack function is called
    expect(msg.ack).toHaveBeenCalled();
});
