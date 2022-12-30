import request from "supertest"
import { app } from "../../../../app"
import createConnection from "../../../../database"
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import { JWTTokenMissingError } from "../../../../shared/errors/JWTTokenMissingError";
import { JWTInvalidTokenError } from "../../../../shared/errors/JWTInvalidTokenError";

let connection: Connection;

const email = 'pedro@fin_api.com.br'
const password = '123456'
const id = uuidV4();
const name = 'Pedro'

describe('Show user profile', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const passwordHash = await hash(password, 8);

    await connection.getRepository('User').save({
      id,
      name,
      email,
      password: passwordHash,
    });



  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show user profile', async () => {

    const responseSession = await request(app).post('/api/v1/sessions').send({
      email,
      password
    });

    const { token } = responseSession.body;

    const response = await request(app).get('/api/v1/profile').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('id');

    expect(response.body).toHaveProperty('name');

    expect(response.body).toHaveProperty('email');

    expect(response.body).toEqual({
      id,
      name,
      email,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })

  })

  it('should not be able to show user profile with wrong token', async () => {

    const response = await request(app).get('/api/v1/profile').set('Authorization', `Bearer token`);

    expect(response.status).toBe(401);

    const errorMessage = new JWTInvalidTokenError().message

    expect(response.body).toEqual({
      message: errorMessage
    })

  })

  it('should not be able to show user profile without token', async () => {

    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(401);

    const errorMessage = new JWTTokenMissingError().message

    expect(response.body).toEqual({
      message: errorMessage
    })

  })


});
