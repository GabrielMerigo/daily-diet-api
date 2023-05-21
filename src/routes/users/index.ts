import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../../database";
import { checkIdExists } from "../../middlewares/check-session-id-exists";

export const usersRoutes = async (app: FastifyInstance) => {
  app.get(
    "/",
    {
      preHandler: [checkIdExists],
    },
    async (req, reply) => {
      const users = await knex("users").select("*");
      return { users };
    }
  );

  app.post("/", async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      image: z.string(),
    });

    const { image, name } = createUserBodySchema.parse(req.body);

    let id = req.cookies.id;

    if (!id) {
      id = crypto.randomUUID();
      (reply as any).cookie("id", id, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("users").insert({
      id,
      image,
      name,
    });

    return reply.status(201).send();
  });
};
