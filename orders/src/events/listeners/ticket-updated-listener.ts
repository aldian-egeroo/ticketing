import {Message} from "node-nats-streaming";
import {Listener, NotFoundError, Subjects, TicketUpdatedEvent} from "@ege.roo/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        const {title, price, id, version} = data;
        // const ticket = await Ticket.findById(id);
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({title, price, version});
        await ticket.save();

        msg.ack();
    }

    queueGroupName = queueGroupName;
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

}