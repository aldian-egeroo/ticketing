import express from "express";
import {json} from "body-parser";
import cookieSession from "cookie-session";
import 'express-async-errors';
import {signoutRouter} from "./routes/signout";
import {signupRouter} from "./routes/signup";
import {currentUserRouter} from "./routes/current-user";
import {signinRouter} from "./routes/signin";
import {NotFoundError, errorHandler} from "@ege.roo/common";

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);

app.use(signoutRouter);
app.use(signupRouter);
app.use(currentUserRouter);
app.use(signinRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };