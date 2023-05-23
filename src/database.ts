import "dotenv/config";
import { knex as setupKnex, Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    "postgres://dietdb_user:EhQP093vYVTAvhD3oXekzsWxScd7tIFj@dpg-chme83j3cv21t621j6lg-a.oregon-postgres.render.com/dietdb?ssl=true",
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knex = setupKnex(config);
