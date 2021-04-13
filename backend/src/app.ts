import "reflect-metadata";
import express, { Request, Response, Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "@reddit/backend/resolvers/post";
import { UserResolver } from "@reddit/backend/resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, __prod__ } from "./constants";
import cors from "cors";
import sendEmail from "@reddit/backend/utils/sendEmail";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

require("dotenv").config();

import { createConnection } from "typeorm";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "redditclone",
    username: "postgres",
    password: "MoniLorenzo23403",
    logging: true,
    synchronize: true,
    entities: [User, Post]
  });

  const PORT = process.env.PORT || 4000;

  const app: Application = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      secret: process.env.SESSION_SECRET
        ? process.env.SESSION_SECRET
        : "fdfs23j!~13fFJKA",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__ // working only in https (in dev we have not https)
      }
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false
    }),
    context: ({ req, res }) => ({ req, res, redis })
  });

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  app.get("/", (req: Request, res: Response) => {
    res.send("App");
  });

  app.listen(PORT, () => console.log(`App running on port ${PORT}`));
};

main();
