// import axios from 'axios';
// import buildClient from "../api/build-client";

import Link from "next/link";

const HomePage = ({ currentUser, tickets  }) => {
    const message = currentUser ? 'You are signed in' : 'You are NOT signed in';

    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href={'/tickets/[ticketId]'} as={`/tickets/${ticket.id}`}>
                        Show
                    </Link>
                </td>
            </tr>
        );
    })
    return (
        <>
            <h1>{message}</h1>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </>

    )
}

HomePage.getInitialProps = async (ctx, client, currentUser) => {
    // const client = buildClient(ctx);
    // const { data } = await client.get('/api/users/currentuser');
    // return data;
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
}

export default HomePage;