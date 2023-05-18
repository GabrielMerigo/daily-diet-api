import { knex as setupKnex, Knex } from "knex";

export const config: Knex.Config = {
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "12345",
    database: "dietDB",
  },
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knex = setupKnex(config);
