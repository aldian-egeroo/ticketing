import {PaymentCreatedEvent, Publisher, Subjects} from "@ege.roo/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}