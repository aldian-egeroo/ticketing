import {ExpirationCompletedEvent, Publisher, Subjects} from "@ege.roo/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompletedEvent> {
    subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
}