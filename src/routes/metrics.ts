import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../database";

export const metricsRoutes = async (app: FastifyInstance) => {
  app.get("/:id", async (req) => {
    const userMetricsParams = z.object({
      id: z.string(),
    });

    const { id } = userMetricsParams.parse(req.params);

    const userMeals = await knex("meals").select({ user_id: id });
    const mealsOnTheDiet = userMeals.filter((meal) => meal.is_on_the_diet);
    const mealsOutTheDiet = userMeals.filter((meal) => !meal.is_on_the_diet);
    const mealsBestSequence = userMeals.reduce((acc, meal) => {
      if (meal.is_on_the_diet) {
        return acc++;
      } else {
        acc = 0;
      }
    }, 0);

    return {
      metrics: {
        meals_total: userMeals.length,
        meals_total_on_the_diet: mealsOnTheDiet.length,
        meals_total_out_the_diet: mealsOutTheDiet.length,
        meals_best_sequence: mealsBestSequence,
      },
    };
  });
};
