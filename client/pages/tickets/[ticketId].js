import useRequest from "../../hooks/use-request";
import Router from "next/router";

const TicketShow = ({ticket}) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: { ticketId: ticket.id },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    });
    const isAvailable = !ticket.orderId;
    return (
        <>
            <h1>{ticket.title}</h1>
            <h4>Price : {ticket.price}</h4>
            <h4>Status : {isAvailable ? 'Available' : 'Not Available'}</h4>
            {errors}
            <button onClick={() => doRequest()}
                    disabled={!isAvailable}
                    className="btn btn-primary">
                Purchase
            </button>
        </>
    );
};

TicketShow.getInitialProps = async (context, client) => {
    const {ticketId} = context.query;
    const {data} = await client.get(`/api/tickets/${ticketId}`);

    return {ticket: data};
}

export default TicketShow;