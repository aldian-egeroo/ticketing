import request from "supertest";
import {app} from "../../app";

it('fails when a email is not exist', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(400);
});

it('fails when incorrect password is supplied', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.id',
            password: '123123asdfasdf'
        })
        .expect(400);
});

it('response with a cookie when given valid credentials', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.id',
            password: 'password'
        })
        .expect(200);
    expect(response.get('Set-Cookie')).toBeDefined();
});