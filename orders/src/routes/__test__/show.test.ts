import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it('fetches the order', async () => {
    // create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 12
    });
    await ticket.save();

    const user = global.signIn();
    // make a request to build an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);
    // make a request to fetch the order
    const {body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('return an error if user not authorized', async () => {
    // create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert00',
        price: 12
    });
    await ticket.save();

    const user = global.signIn();
    // make a request to build an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);
    // make a request to fetch the order
    const {body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signIn())
        .send()
        .expect(401);

});