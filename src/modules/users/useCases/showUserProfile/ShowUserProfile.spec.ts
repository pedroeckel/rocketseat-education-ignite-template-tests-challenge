import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let userRepository: InMemoryUsersRepository;

interface userDTO {
  name: string;
  email: string;
  password: string;
}

describe('ShowUserProfile', () => {

  it('should show user profile', async () => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);

    const user: userDTO = {
      name: "John Show User Profile",
      email: "john_show_user_profile@mail.com",
      password: "123456"
    }

    const userResponse = await createUserUseCase.execute(user);

    showUserProfileUseCase = new ShowUserProfileUseCase(userRepository);

    const userProfile = await showUserProfileUseCase.execute(userResponse.id as string);

    expect(userProfile).toBeTruthy();

    expect(userProfile).toHaveProperty('id');

    expect(userProfile.name).toBe(user.name);

    expect(userProfile.email).toBe(user.email);

  })

  it('should not show user profile if user not found', async () => {
    expect(async () => {
      showUserProfileUseCase = new ShowUserProfileUseCase(userRepository);

      await showUserProfileUseCase.execute('123');

    }).rejects.toBeInstanceOf(ShowUserProfileError);

  })


});
