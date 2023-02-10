import express, {Request, Response} from "express";
import {body} from "express-validator";
import {User} from "../models/user";
import {BadRequestError, validateRequest} from "@ege.roo/common";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signup', [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({min: 4, max: 20})
            .withMessage('Password must be between 4 and 20 chars')
    ], validateRequest
    , async (req: Request, res: Response) => {

        const {email, password} = req.body;

        console.log('Creating user');
        const existingUser = await User.findOne({email});

        if (existingUser) {
            console.log('Email in use');
            throw new BadRequestError('Email in use')
        }

        const user = User.build({
            email, password
        });
        await user.save();

        // generate jwt
        const userJwt = jwt.sign({
                id: user.id,
                email: email
            }, process.env.JWT_KEY!
        );

        // store it on session object
        req.session = {
            jwt: userJwt
        }

        res.status(201).send(user);
        // throw new Error('Error connecting to dbase');
        // throw new DatabaseConnectionError();
        // res.send({});
    })

export {router as signupRouter};