import {Listener, OrderCreatedEvent, Subjects} from "@ege.roo/common";
import {Message} from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publisher/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        // find the ticket that the order are reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket throw an error
        if (!ticket){
            throw new Error('Ticket not found');
        }

        // mark the ticket as being reversed, sett order id property
        ticket.set({orderId: data.orderId});

        // update the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        // ack the message
        msg.ack();
    }

    queueGroupName = queueGroupName;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

}