import {OrderCancelledEvent, Publisher, Subjects} from "@ege.roo/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}