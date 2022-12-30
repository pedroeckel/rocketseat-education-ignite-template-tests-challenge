import { inject, injectable } from "tsyringe";
import { hash } from 'bcryptjs';

import { CreateUserError } from "./CreateUserError";

import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ICreateUserDTO } from "./ICreateUserDTO";
import isEmail from "validator/lib/isEmail";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  async execute({ name, email, password }: ICreateUserDTO) {

    if (!name || !email || !password) {
      throw new CreateUserError.RequireFields();
    }

    if (isEmail(email) === false) {
      throw new CreateUserError.InvalidEmail();
    }

    const userAlreadyExists = await this.usersRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new CreateUserError.UserAlreadyExists();
    }

    const passwordHash = await hash(password, 8);

    const user = await this.usersRepository.create({
      email,
      name,
      password: passwordHash,
    });

    return user;
  }
}
