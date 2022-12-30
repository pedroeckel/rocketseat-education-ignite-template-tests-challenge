import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let createUserUseCase: CreateUserUseCase;
let userRepository: InMemoryUsersRepository;

describe("Create User", () => {

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  it("should create a user", async () => {
    const user: User = await createUserUseCase.execute({
      name: "John",
      email: "john@mail.com",
      password: "123456"
    });

    expect(user).toBeTruthy();

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John");
    expect(user.email).toBe("john@mail.com");

    expect(user.password).not.toBe("123456");

    expect(user.password).toHaveLength(60);
  });

  it("should not create a user if email already exists", async () => {
    await createUserUseCase.execute({
      name: "John Email Already",
      email: "john_email_already@mail.com",
      password: "123456"
    });

    await expect(createUserUseCase.execute({
      name: "John Email Already 2",
      email: "john_email_already@mail.com",
      password: "123456789"
    })).rejects.toBeInstanceOf(CreateUserError);

  });

})
