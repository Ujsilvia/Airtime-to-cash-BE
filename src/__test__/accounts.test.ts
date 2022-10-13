import 'dotenv/config';
import app from '../app';
import supertest from 'supertest';

import db from '../config/database.config';

const request = supertest(app);

beforeAll(async () => {
  await db.sync({ force: true }).then(() => {
    console.log('Database successfully created for test');
  });
});

describe('it should test all apis', () => {
  // Testing for sign up
  it('it should create a user', async () => {
    const response = await request.post('/users/users').send({
      firstname: 'Jane2',
      lastname: 'Danny2',
      email: 'jane12@example.com',
      username: 'janeDanny12',
      phoneNumber: '07971192932',
      password: '12345',
      confirmPassword: '12345',
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully created a user');
    expect(response.body.status).toBe('Success');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('token');

const token = response.body.token;
const verifyUser = await request.get(`/users/verify/${token}`)
expect(verifyUser.status).toBe(200);


  });

//  // Login with username
//  it('should login a user with email', async () => {
//   const response = await request.post('/users/login').send({
//     username: 'jane12',
//     password: '12345',
//   });

//   const token = response.body.token;
//   expect(response.status).toBe(200);
//   expect(response.body.message).toBe('Login successful');
//   expect(response.body).toHaveProperty('token');
//   expect(response.body).toHaveProperty('User');
// });

  //Login with email
  it('should login a user with email', async () => {
    const response = await request.post('/users/login').send({
      email: 'jane12@example.com',
      password: '12345',
    });
    const token = response.body.token;
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('User');
  });

  it('it should create a bank account', async () => {

    const user = await request.post('/users/login').send({
      email: 'jane12@example.com',
      password: '12345',
    });


    const token = user.body.token;
    const response = await request.post('/account/create').set('Authorization', `Bearer ${token}`).send({
      bankName: 'Access Bank',
      accountNumber: '1234567890',
      accountName: 'John Doe',
      walletBalance: 1000,

    });


    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Account created successfully');
    expect(response.body.status).toBe('success');
    expect(response.body).toHaveProperty('data');
  });

  //Get all accounts
  it('should fetch all bank accounts', async () => {

    const user = await request.post('/users/login').send({
      email: 'jane12@example.com',
      password: '12345',
    });


    const token = user.body.token;

    const response = await request.get('/account/getaccount').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Account retrieved successfully');
    expect(response.body.status).toBe('success');
    expect(response.body).toHaveProperty('data');
  });


});

