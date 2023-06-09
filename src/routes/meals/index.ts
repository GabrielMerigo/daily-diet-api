import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../../database";

import { checkIdExists } from "../../middlewares/check-session-id-exists";

export const mealsRoutes = async (app: FastifyInstance) => {
  app.addHook("preHandler", checkIdExists);

  app.get("/", async (req) => {
    const userId = req.cookies.id;
    const meals = await knex("meals").where({ user_id: userId }).select("*");
    return { meals };
  });

  app.get("/:id", async (req) => {
    const deleteMealParams = z.object({
      id: z.string(),
    });

    const { id } = deleteMealParams.parse(req.params);

    const meal = await knex("meals").where({ id }).first();
    return { meal };
  });

  app.post("/", async (req, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_meal: z.string(),
      hour_meal: z.string(),
      is_on_the_diet: z.boolean(),
    });

    const { date_meal, name, description, hour_meal, is_on_the_diet } =
      createMealBodySchema.parse(req.body);

    const id = req.cookies.id;

    const user = await knex("users").where({ id: id });
    if (!user.length) return reply.status(404).send("User not found");

    await knex("meals").insert({
      id: crypto.randomUUID(),
      name,
      description,
      date_meal,
      hour_meal,
      is_on_the_diet,
      user_id: id,
    });

    return reply.status(201).send();
  });

  app.put("/:id", async (req, reply) => {
    const editMealParams = z.object({
      id: z.string(),
    });

    const editMealBodySchema = z.object({
      name: z.string().nullish(),
      description: z.string().nullish(),
      date_meal: z.string().nullish(),
      hour_meal: z.string().nullish(),
      is_on_the_diet: z.boolean().nullish(),
    });

    const { id } = editMealParams.parse(req.params);
    const { date_meal, name, description, hour_meal, is_on_the_diet } =
      editMealBodySchema.parse(req.body);

    await knex("meals").where({ id }).update({
      date_meal,
      name,
      description,
      hour_meal,
      is_on_the_diet,
    });

    return reply.status(200).send();
  });

  app.delete("/:id", async (req, reply) => {
    const deleteMealParams = z.object({
      id: z.string(),
    });

    const { id } = deleteMealParams.parse(req.params);

    await knex("meals").where({ id }).delete();

    return reply.status(204).send();
  });
};
