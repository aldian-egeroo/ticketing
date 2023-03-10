import express, {Request, Response} from "express";
import { Order, OrderStatus } from "../models/order";
import {NotAuthorizeError, NotFoundError, requireAuth} from "@ege.roo/common";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');
    console.log(order!.ticket.id);
    if (!order){
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id){
        throw new NotAuthorizeError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish delete order
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        }
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };