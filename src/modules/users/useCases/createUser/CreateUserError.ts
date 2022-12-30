import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateUserError {

  export class RequireFields extends AppError {
    constructor() {
      super('Missing required fields', 400);
    }
  }
  export class UserAlreadyExists extends AppError {
    constructor() {
      super('User already exists');
    }
  }

  export class InvalidEmail extends AppError {
    constructor() {
      super('Invalid email');
    }
  }
}
