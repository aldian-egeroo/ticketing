import request from "supertest";
import {app} from "../../app";

it('sign up and returns a 201', () =>{
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(201);
});

it('returns a 400 with invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@tesid',
            password: 'password'
        })
        .expect(400);
});

it('returns a 400 with invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.idid',
            password: 'pas'
        })
        .expect(400);
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(400);
});

it('sets a cookie after signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
});