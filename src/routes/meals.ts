import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../database";

export const mealsRoutes = async (app: FastifyInstance) => {
  app.get("/", async () => {
    const data = await knex("meals").select("*");
    return data;
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

    await knex("meals").insert({
      id: crypto.randomUUID(),
      name,
      description,
      date_meal,
      hour_meal,
      is_on_the_diet,
    });

    return reply.status(201).send();
  });

  app.put("/:id", async (req, reply) => {
    const editMealParam = z.object({
      id: z.string(),
    });

    const editMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_meal: z.string(),
      hour_meal: z.string(),
      is_on_the_diet: z.boolean(),
    });

    const { id } = editMealBodySchema.parse(req.body);

    return reply.status(200).send();
  });
};
