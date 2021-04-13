import * as EmailValidator from "email-validator";
import { UsernamePasswordInput } from "@reddit/backend/resolvers/interfaces/UsernamePasswordInput";

const validateRegister = (options: UsernamePasswordInput) => {
  if (!EmailValidator.validate(options.email)) {
    return [
      {
        field: "email",
        message: "insert a valid email"
      }
    ];
  }

  if (EmailValidator.validate(options.username)) {
    return [
      {
        field: "username",
        message: "username cannot be an email"
      }
    ];
  }

  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than two"
      }
    ];
  }
  if (options.password.length <= 3) {
    return [
      {
        field: "password",
        message: "length must be greater than three"
      }
    ];
  }
  return null;
};

export default validateRegister;
