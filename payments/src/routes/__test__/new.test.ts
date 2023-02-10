import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@ege.roo/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

it('return 404 when purchasing order not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signIn())
        .send({
            token: 'asdf',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);

});

it('return a 401 when purchasing an order that not belong to user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signIn())
        .send({
            token: 'asdfasdf',
            orderId: order.id
        })
        .expect(401);
});

it('return 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Cancelled,
        userId,
        version: 0
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signIn(userId))
        .send({
            token: 'asdfasdf',
            orderId: order.id
        })
        .expect(400);

});

it('return 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: Math.floor(Math.random() * 10000),
        status: OrderStatus.Created,
        userId,
        version: 0
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signIn(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    // const chargeOptions = (stripeTs.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.amount).toEqual(100);
    // expect(chargeOptions.currency).toEqual('eur');
    const stripeCharges = await stripe.charges.list({ limit: 5 });
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === order.price * 100);
    console.log(stripeCharge);
    expect(stripeCharge).toBeDefined();
});

it('return 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: Math.floor(Math.random() * 100),
        status: OrderStatus.Created,
        userId,
        version: 0
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signIn(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 5 });
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === order.price * 100);
    console.log(stripeCharge);
    expect(stripeCharge).toBeDefined();

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull();
});