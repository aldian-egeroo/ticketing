import express, {Request, Response} from "express";
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@ege.roo/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders',
    requireAuth, [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const {ticketId} = req.body;

        // find the ticket the user trying to order
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        // make sure the ticket is not reserved from order
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        // calculate an expiration date for the order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // build the order and save to dbase
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket: ticket
        });
        await order.save();

        // publish an event
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            expiresAt: order.expiresAt.toISOString(),
            orderId: order.id,
            status: order.status,
            ticket: {
                id: ticket.id,
                price: ticket.price,
                // version: ticket.version
            },
            userId: order.userId,
            version: order.version
        });

        res.status(201).send(order);
    });

export {router as newOrderRouter};