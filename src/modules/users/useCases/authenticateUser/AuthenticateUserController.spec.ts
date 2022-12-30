import request from "supertest"
import { app } from "../../../../app"
import createConnection from "../../../../database"
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let connection: Connection;

const email = 'pedro@fin_api.com.br'
const password = '123456'

describe('Authenticate User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash(password, 8);

    await connection.getRepository('User').save({
      id,
      name: 'Pedro',
      email,
      password: passwordHash,
    });



  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email,
      password
    });
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('token');


  });

  it('should not be able to authenticate with non existing user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'nonexisting@mail.com',
      password
    });

    expect(response.status).toBe(401);

    const errorMessage = new IncorrectEmailOrPasswordError().message

    expect(response.body).toEqual({
      message: errorMessage
    })

  });

  it('should not be able to authenticate with wrong password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email,
      password: 'wrong-password'
    });

    expect(response.status).toBe(401);

    const errorMessage = new IncorrectEmailOrPasswordError().message

    expect(response.body).toEqual({
      message: errorMessage
    })

  })

})
