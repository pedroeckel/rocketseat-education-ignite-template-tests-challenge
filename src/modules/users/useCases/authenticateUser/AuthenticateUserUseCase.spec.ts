import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let userRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
  });

  it("should authenticate user", async () => {
    const user = {
      name: "John",
      email: "john@mail.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "john@mail.com",
        password: "123456",
      });
    });


  });

  it("should not authenticate user if email not found", async () => {
    await expect(authenticateUserUseCase.execute({
      email: "error@mail.com",
      password: "123456"
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  })

  it("should not authenticate user if password not match", async () => {
    const user: User = await createUserUseCase.execute({
      name: "John",
      email: "john_password_error@mail.com",
      password: "123456"
    });

    await expect(authenticateUserUseCase.execute({
      email: user.email,
      password: "123456789"
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  })

})
