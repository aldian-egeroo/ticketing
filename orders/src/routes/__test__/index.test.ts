import request from "supertest";
import {app} from "../../app";
import {Order} from "../../models/order";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket = async (idx: number) => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: `concert ${idx}`,
        price: 20
    });

    await ticket.save();
    return ticket;
}

it('fetches some order for a particular user', async () => {
    // create 3 tickets
    const ticketOne = await buildTicket(1);
    const ticketTwo = await buildTicket(2);
    const ticketThree = await buildTicket(3);

    const userOne = global.signIn();
    const userTwo = global.signIn();

    // create 1 order as user #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id})
        .expect(201);

    // create 2 order as user #2
    const {body: orderOne} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id})
        .expect(201);
    const {body: orderTwo} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id})
        .expect(201);


    // make request to get orders for user #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    // make sure we only got the orders for user #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
})