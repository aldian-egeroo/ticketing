import { Publisher, Subjects, TicketCreatedEvent} from "@ege.roo/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}