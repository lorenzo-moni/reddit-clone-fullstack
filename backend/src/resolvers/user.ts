import { User } from "@reddit/backend/entities/User";
import { MyContext } from "types";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  InputType,
  Ctx,
  ObjectType
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

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
  async me(@Ctx() { req, em }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than two"
          }
        ]
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than three"
          }
        ]
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
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

    // log them in if they register by storing the cookie
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username
    });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exists"
          }
        ]
      };
    }
    const isValid = await argon2.verify(user.password, options.password);
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
}
