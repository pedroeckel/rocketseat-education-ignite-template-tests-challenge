import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it("should get balance", async () => {
    const userDTO = {
      name: "John",
      email: "john_create@mail.com",
      password: "123456",
    };

    const user = await usersRepository.create(userDTO);

    const statementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit"
    };

    await statementsRepository.create(statementDTO);

    const response = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(response.balance).toBe(1000);
  })

  it("should get balance if user not found", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "not_found" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })

  it("should get balance if user has no statements", async () => {
    const userDTO = {
      name: "John",
      email: "john_create@mail.com",
      password: "123456",
    };

    const user = await usersRepository.create(userDTO);

    const response = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(response.balance).toBe(0);

  })
})
