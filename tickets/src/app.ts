import express from "express";
import {json} from "body-parser";
import cookieSession from "cookie-session";
import 'express-async-errors';
import {createTicketRouter} from "./routes/new";
import {showTicketRouter} from "./routes/show";
import {indexTicketsRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";
import {currentUser, errorHandler} from "@ege.roo/common";

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter)
app.use(indexTicketsRouter)

app.use(errorHandler);
export {app};