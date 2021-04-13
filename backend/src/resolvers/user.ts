import { User } from "@reddit/backend/entities/User";
import { MyContext } from "types";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import * as EmailValidator from "email-validator";
import { UsernamePasswordInput } from "@reddit/backend/resolvers/interfaces/UsernamePasswordInput";
import validateRegister from "@reddit/backend/utils/validateRegister";
import sendEmail from "@reddit/backend/utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();
    redis.set(
      FORGOT_PASSWORD_PREFIX + token, // prefix
      user.id, // key
      "ex", // expiration date
      1000 * 60 * 60 * 24 * 3 // three days
    );
    const frontendUrl = process.env.FRONTEND_URL;
    const emailBody = `<a href='${frontendUrl}/change-password/${token}'>Reset Password</a>`;

    sendEmail("Reddit", email, "Recover Password", emailBody);

    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(options.password);
    let user;

    try {
      user = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword
      }).save();
    } catch (err) {
      if (err.code === "23505") {
        if (err.detail.includes("email")) {
          return {
            errors: [
              {
                field: "email",
                message: "the email already taken"
              }
            ]
          };
        } else if (err.detail.includes("username")) {
          return {
            errors: [
              {
                field: "username",
                message: "the username already taken"
              }
            ]
          };
        }
      }
    }

    // log them in if they register by storing the cookie
    req.session.userId = user?.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      EmailValidator.validate(usernameOrEmail)
        ? {
            where: { email: usernameOrEmail }
          }
        : {
            where: { username: usernameOrEmail }
          }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username or email doesn't exists"
          }
        ]
      };
    }
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return {
        errors: [
          {
            field: "password",
            message: "password incorrect"
          }
        ]
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than three"
          }
        ]
      };
    }

    const redisKey = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(redisKey);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired"
          }
        ]
      };
    }
    const userIdNumber = parseInt(userId);
    const user = await User.findOne(userIdNumber);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists"
          }
        ]
      };
    }

    await User.update(
      { id: userIdNumber },
      { password: await argon2.hash(newPassword) }
    );

    // login after changing password

    redis.del(redisKey);
    req.session.userId = user.id;

    return { user };
  }
}
