import nats from 'node-nats-streaming';
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect('ticket', 'abc', {
    url: 'http://localhost:4222'
});



stan.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);
    try {
        console.log(new Date());
        await publisher.publish({
            id: '1233',
            title: 'Some title2',
            price: 12
        });
    } catch (e) {
        console.error(e);
    }

    // const data = JSON.stringify({
    //     id: '123',
    //     title: 'concert',
    //     price: 20
    // });
    //
    // stan.publish('ticket:created', data, () => {
    //     console.log('Event published');
    // });

});