import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";

it('returns 404 if ticket not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signIn())
        .send({
            title: 'some',
            price: 10
        })
        .expect(404);
});

it('returns 401 if user not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'some',
            price: 10
        })
        .expect(401);
});

it('returns 401 if user does not own the ticket', async () => {
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', global.signIn())
        .send({
            title: 'some',
            price: 10
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signIn())
        .send({
            title: 'test',
            price: 12
        })
        .expect(401);
});
it('returns 400 if user provides an invalid title', async () => {
    const cookie = global.signIn();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'some',
            price: 10
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            price: 12
        })
        .expect(400);

});
it('updates the ticket with valid input', async () => {
    const cookie = global.signIn();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'some',
            price: 10
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 's0me',
            price: 12
        })
        .expect(200);
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('s0me');
    expect(ticketResponse.body.price).toEqual(12);
});


it('published an event', async () => {
    const cookie = global.signIn();

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'some',
            price: 10
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 's0me',
            price: 12
        })
        .expect(200);
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('reject update if ticket is reserved', async () => {
    const cookie = global.signIn();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'new',
            price: 20
        });
    const ticket = await Ticket.findById(response.body.id);

    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});

    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new',
            price: 15
        })
        .expect(400);

});