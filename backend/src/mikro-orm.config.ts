import { __prod__ } from "./constants";
import path from "path";
import { Options } from "@mikro-orm/core";
import { Post } from "@reddit/backend/entities/Post";
import { User } from "@reddit/backend/entities/User";
require("dotenv").config();

const config: Options = {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/
  },
  entities: [Post, User],
  clientUrl: process.env.DATABASE_URL,
  dbName: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  type: "postgresql",
  debug: !__prod__
};

export default config;
