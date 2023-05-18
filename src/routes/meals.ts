import { FastifyInstance } from "fastify";
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
      dateMeal: z.string(),
      hourMeal: z.string(),
      isOnTheDiet: z.boolean(),
    });

    const { dateMeal, description, hourMeal, isOnTheDiet } =
      createMealBodySchema.parse(req.body);

    knex("meals").insert({
      name,
      description,
    });
  });
};
