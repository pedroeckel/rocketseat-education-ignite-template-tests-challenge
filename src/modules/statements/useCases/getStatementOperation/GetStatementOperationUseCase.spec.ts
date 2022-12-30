import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
  });

  it("should get statement operation", async () => {
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

    const statement = await statementsRepository.create(statementDTO);

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    });

    expect(statementOperation).toEqual({
      id: statement.id,
      user_id: user.id,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "deposit"
    });
  });

  it("should not get statement operation if user not found", async () => {

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
        description: "deposit",
        amount: 300,
      };

      const statement = await statementsRepository.create(statementDTO);

      await getStatementOperationUseCase.execute({
        user_id: "not_found",
        statement_id: statement.id as string
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })

  it("should not get statement operation if statement not found", async () => {
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
        description: "deposit",
        amount: 300,
      };

      await statementsRepository.create(statementDTO);

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "not_found"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);

  });
});
