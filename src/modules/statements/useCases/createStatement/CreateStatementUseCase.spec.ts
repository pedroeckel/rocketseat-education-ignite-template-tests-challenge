import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  it("should create statement", async () => {
    const userDTO = {
      name: "John",
      email: "john_create@mail.com",
      password: "123456",
    };

    const user = await usersRepository.create(userDTO);

    const statementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit"
    };

    const statement = await createStatementUseCase.execute(statementDTO);

    expect(statement).toHaveProperty("id");

    expect(statement).toEqual({
      id: expect.any(String),
      user_id: user.id,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "deposit"
    });

  });

  it("should not create statement if user not found", async () => {
    expect(async () => {
      const statementDTO = {
        user_id: "not_found",
        type: OperationType.DEPOSIT,
        description: "deposit",
        amount: 300,

      }
      await createStatementUseCase.execute(statementDTO)
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not create statement if amount is negative", async () => {

    expect(async () => {
      const userDTO = {
        name: "John 2",
        email: "john_create2@mail.com",
        password: "123456",
      };

      const user = await usersRepository.create(userDTO);

      const statementDTO = {
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: -100,
        description: "deposit"
      };

      await createStatementUseCase.execute(statementDTO)
    }).rejects.toBeInstanceOf(CreateStatementError.InvalidAmount);
  });

  it("Shouldn't be able to create a statement withdraw greater than the balance", async () => {
    expect(
      async () => {
        const userDTO = {
          name: "John 3",
          email: "john_create3@mail.com",
          password: "123456"
        };
        const user = await usersRepository.create(userDTO);
        const statementDTO = {
          user_id: user.id as string,
          type: OperationType.WITHDRAW,
          description: "withdraw",
          amount: 100,

        }
        await createStatementUseCase.execute(statementDTO)
      }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Shouldn't be able to create a statement with invalid type", async () => {
    expect(
      async () => {
        const userDTO = {
          name: "John 3",
          email: "john_create3@mail.com",
          password: "123456"
        };
        const user = await usersRepository.create(userDTO);

        const statementDTO = {
          user_id: user.id as string,
          type: "invalid",
          description: "withdraw",
          amount: 100,
        }

        await createStatementUseCase.execute(statementDTO as any)

      }).rejects.toBeInstanceOf(CreateStatementError.InvalidOperationType);

  });


})
