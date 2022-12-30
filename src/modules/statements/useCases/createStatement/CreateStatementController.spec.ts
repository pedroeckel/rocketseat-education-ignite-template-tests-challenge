import request from "supertest"
import { app } from "../../../../app"
import createConnection from "../../../../database"
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import { JWTInvalidTokenError } from "../../../../shared/errors/JWTInvalidTokenError";
import { JWTTokenMissingError } from "../../../../shared/errors/JWTTokenMissingError";
import { CreateStatementError } from "./CreateStatementError";

let connection: Connection;

const email = 'pedro@fin_api.com.br'
const password = '123456'
const amount = 100
const user_id = uuidV4();

describe('Create statement', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();


    const passwordHash = await hash(password, 8);

    await connection.getRepository('User').save({
      id: user_id,
      name: 'Pedro',
      email,
      password: passwordHash,
    });

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  describe('Create statement deposit', () => {

    const description = 'Money deposit'
    const type = 'deposit'



    it('should be able to create statement', async () => {
      const responseSession = await request(app).post('/api/v1/sessions').send({
        email,
        password
      });

      const { token } = responseSession.body;

      const response = await request(app).post(`/api/v1/statements/${type}`).set('Authorization', `Bearer ${token}`).send({
        amount,
        description,
      })

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        user_id,
        type,
        amount,
        description,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })

    it(`should not be able to create statement ${type} with wrong token`, async () => {

      const response = await request(app).post(`/api/v1/statements/${type}`).set('Authorization', `Bearer token`).send({
        amount: 100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(401);

      const errorMessage = new JWTInvalidTokenError().message

      expect(response.body).toEqual({
        message: errorMessage
      })

    })

    it(`should not be able to create statement ${type} without token`, async () => {

      const response = await request(app).post(`/api/v1/statements/${type}`).send({
        amount: 100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(401);

      const errorMessage = new JWTTokenMissingError().message

      expect(response.body).toEqual({
        message: errorMessage
      })

    })

    it(`should not be able to create statement ${type} with invalid amount`, async () => {

      const responseSession = await request(app).post('/api/v1/sessions').send({
        email,
        password
      });

      const { token } = responseSession.body;

      const response = await request(app).post(`/api/v1/statements/${type}`).set('Authorization', `Bearer ${token}`).send({
        amount: -100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(400);

      const errorMessage = new CreateStatementError.InvalidAmount().message

      expect(response.body).toEqual({
        message: errorMessage
      })

    })

    it(`should not be able to create statement ${type} with invalid operation type`, async () => {

      const responseSession = await request(app).post('/api/v1/sessions').send({
        email,
        password
      });

      const { token } = responseSession.body;

      const response = await request(app).post(`/api/v1/statements/invalid_type`).set('Authorization', `Bearer ${token}`).send({
        amount: 100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(404);

    })



  })

  describe('Create statement withdraw', () => {

    const description = 'Money withdraw'
    const type = 'withdraw'

    it('should be able to create statement', async () => {
      const responseSession = await request(app).post('/api/v1/sessions').send({
        email,
        password
      });

      const { token } = responseSession.body;

      const response = await request(app).post(`/api/v1/statements/${type}`).set('Authorization', `Bearer ${token}`).send({
        amount,
        description,
      })

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        user_id,
        type,
        amount,
        description,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })

    it(`should not be able to create statement ${type} with wrong token`, async () => {

      const response = await request(app).post(`/api/v1/statements/${type}`).set('Authorization', `Bearer token`).send({
        amount: 100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(401);

      const errorMessage = new JWTInvalidTokenError().message

      expect(response.body).toEqual({
        message: errorMessage
      })

    })

    it(`should not be able to create statement ${type} without token`, async () => {

      const response = await request(app).post(`/api/v1/statements/${type}`).send({
        amount: 100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(401);

      const errorMessage = new JWTTokenMissingError().message

      expect(response.body).toEqual({
        message: errorMessage
      })

    })

    it(`should not be able to create statement ${type} with invalid amount`, async () => {

      const responseSession = await request(app).post('/api/v1/sessions').send({
        email,
        password
      });

      const { token } = responseSession.body;

      const response = await request(app).post(`/api/v1/statements/${type}`).set('Authorization', `Bearer ${token}`).send({
        amount: -100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(400);

      const errorMessage = new CreateStatementError.InvalidAmount().message

      expect(response.body).toEqual({
        message: errorMessage
      })

    })

    it(`should not be able to create statement ${type} with invalid operation type`, async () => {

      const responseSession = await request(app).post('/api/v1/sessions').send({
        email,
        password
      });

      const { token } = responseSession.body;

      const response = await request(app).post(`/api/v1/statements/invalid_type`).set('Authorization', `Bearer ${token}`).send({
        amount: 100,
        description: 'Money deposit',
      })

      expect(response.status).toBe(404);

    })
  })
})
