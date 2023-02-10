import {OrderCreatedEvent, Publisher, Subjects} from "@ege.roo/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}