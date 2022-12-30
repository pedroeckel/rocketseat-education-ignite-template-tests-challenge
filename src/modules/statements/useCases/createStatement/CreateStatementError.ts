import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

  export class InvalidAmount extends AppError {
    constructor() {
      super('Invalid amount', 400);
    }
  }

  export class InvalidOperationType extends AppError {
    constructor() {
      super('Invalid operation type', 400);
    }
  }


}
