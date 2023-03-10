import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it('has a route handler listening to /api/tickets for post request', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});
it('can only be access if user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({}).expect(401);
});

it('returns status other than 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({});
    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({
            price: 10
        })
        .expect(400);
});
it('return an error if an invalid price is provided', async () => {

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({
            title: 'Some title',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({
            title: 'Some title',
        })
        .expect(400);
});
it('created ticket with valid input', async () => {
    // add in a check to make sure a ticket is created in dbase
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({
            title: 'some string',
            price: 10
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('published an event', async () => {
    const title = 'some';

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signIn())
        .send({
            title,
            price: 20
        })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});