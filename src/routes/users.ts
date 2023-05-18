import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../database";

export const usersRoutes = async (app: FastifyInstance) => {
  app.get("/", async (req, reply) => {
    const data = await knex("users").select("*");
    reply.statusCode = 200;
    reply.send(data);
  });

  app.post("/", async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      image: z.string(),
    });

    const { image, name } = createUserBodySchema.parse(req.body);

    await knex("users").insert({
      id: crypto.randomUUID(),
      image,
      name,
    });

    return reply.status(201).send();
  });
};
