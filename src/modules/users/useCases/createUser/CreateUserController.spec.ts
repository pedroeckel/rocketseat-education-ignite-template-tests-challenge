import request from "supertest"
import { app } from "../../../../app"
import createConnection from "../../../../database"
import { Connection } from "typeorm";
import { CreateUserError } from "./CreateUserError";

let connection: Connection;

describe('Create User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: "John",
      email: "john@mail.com",
      password: "123456"
    })

    expect(response.status).toBe(201)
  })

  it('should not be able to create a new user with same email from another', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: "John",
      email: "john@mail.com",
      password: "123456"
    })

    expect(response.status).toBe(400)

    const errorMessage = new CreateUserError.UserAlreadyExists().message

    expect(response.body).toEqual({
      message: errorMessage
    })
  })

  it('should not be able to create a new user with invalid email', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: "John",
      email: "",
      password: "123456"
    })

    expect(response.status).toBe(400)

    const errorMessage = new CreateUserError.RequireFields().message

    expect(response.body).toEqual({
      message: errorMessage
    })
  })

  it('should not be able to create a new user with invalid name', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: "",
      email: "john_invalid_name@mail.com",
      password: "123456"
    })

    expect(response.status).toBe(400)

    const errorMessage = new CreateUserError.RequireFields().message

    expect(response.body).toEqual({
      message: errorMessage
    })

  })

  it('should not be able to create a new user with invalid password', async () => {

    const response = await request(app).post('/api/v1/users').send({
      name: "John Invalid Password",
      email: "john_invalid_password@mail.com",
      password: ""
    })

    expect(response.status).toBe(400)

    const errorMessage = new CreateUserError.RequireFields().message

    expect(response.body).toEqual({
      message: errorMessage
    })

  })
})
