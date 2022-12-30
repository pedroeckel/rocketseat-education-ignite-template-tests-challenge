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
    })).rejects.toBeInstanceOf(CreateUserError.UserAlreadyExists);

  });

  it("should not create a user if email is invalid", async () => {
    await expect(createUserUseCase.execute({
      name: "John Email Invalid",
      email: "",
      password: "123456"
    })).rejects.toBeInstanceOf(CreateUserError.RequireFields);

    await expect(createUserUseCase.execute({
      name: "John Email Invalid",
      email: "john_email_invalid",
      password: "123456"
    })).rejects.toBeInstanceOf(CreateUserError.InvalidEmail);

    await expect(createUserUseCase.execute({
      name: "John Email Invalid 2",
      email: "john_email_invalid@",
      password: "123456"
    })).rejects.toBeInstanceOf(CreateUserError.InvalidEmail);

    await expect(createUserUseCase.execute({
      name: "John Email Invalid 3",
      email: "john_email_invalid@mail",
      password: "123456"
    })).rejects.toBeInstanceOf(CreateUserError.InvalidEmail);

    await expect(createUserUseCase.execute({
      name: "John Email Invalid 4",
      email: "john_email_invalid@mail.",
      password: "123456"
    })).rejects.toBeInstanceOf(CreateUserError.InvalidEmail);
  });

  it("should not create a user if name is invalid", async () => {
    await expect(createUserUseCase.execute({
      name: "",
      email: "john_name_invalid@mail.com",
      password: "123456"
    })).rejects.toBeInstanceOf(CreateUserError.RequireFields);

  });

  it("should not create a user if password is invalid", async () => {
    await expect(createUserUseCase.execute({
      name: "John Password Invalid",
      email: "john_password_invalid@mail.com",
      password: ""
    })).rejects.toBeInstanceOf(CreateUserError.RequireFields);

  });

})
