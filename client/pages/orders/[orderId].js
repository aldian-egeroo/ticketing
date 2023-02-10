import {useEffect, useState} from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ currentUser, order }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        method: 'post',
        url: '/api/payments',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000) );
        }

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, []);

    if (timeLeft < 0) {
        return <div>Your order is expired</div>
    }

    return <div>Time left to pay : {timeLeft} seconds
        <StripeCheckout
            token={({id}) => doRequest({token: id})}
            stripeKey={'pk_test_51Jdc9qBrgaCPV6Rr4i0voFqptxurX2vkJKudsYfSne5QFH3BjBcoy2ttnuZtu67Ap3tYOWCJ3xuyRUVYUBv3mYet00Dtc7h2ht'}
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        {errors}
    </div>;
}

OrderShow.getInitialProps = async (context, client) => {
    const {orderId} = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);

    return {order: data};
}

export default OrderShow;