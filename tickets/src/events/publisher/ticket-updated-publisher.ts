import { Publisher, Subjects, TicketUpdatedEvent} from "@ege.roo/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}