import request from "supertest"
import { app } from "../../../../app"
import createConnection from "../../../../database"
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;

const email = 'pedro@fin_api.com.br'
const password = '123456'
const user_id = uuidV4();

describe('Get Balance', () => {

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

  it('should be able to get balance without statement', async () => {
    const responseSession = await request(app).post('/api/v1/sessions').send({
      email,
      password
    });

    const { token } = responseSession.body;

    const response = await request(app).get(`/api/v1/statements/balance`).set('Authorization', `Bearer ${token}`)

    console.log(response.body)

    expect(response.status).toBe(200);
  })

  it('should be able to get balance with statement', async () => {
    const responseSession = await request(app).post('/api/v1/sessions').send({
      email,
      password
    });

    const { token } = responseSession.body;

    const amount = 100
    const description = 'Money deposit'

    const responseStatement = await request(app).post(`/api/v1/statements/deposit`).set('Authorization', `Bearer ${token}`).send({
      amount,
      description,
    })

    console.log(responseStatement.body)

    const response = await request(app).get(`/api/v1/statements/balance`).set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200);

    console.log(response.body)

    // expect(response.body).toEqual({
    //   balance: amount,
    //   statement: [
    //     responseStatement.body
    //   ]
    // })

  });
})
