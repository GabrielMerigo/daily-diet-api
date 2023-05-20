import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkIdExists } from "../middlewares/check-session-id-exists";

export const metricsRoutes = async (app: FastifyInstance) => {
  app.get(
    "/:id",
    {
      preHandler: [checkIdExists],
    },
    async (req) => {
      const userMetricsParams = z.object({
        id: z.string(),
      });

      const { id } = userMetricsParams.parse(req.params);

      const userMeals = await knex("meals").where({ user_id: id }).select("*");
      const mealsOnTheDiet = userMeals.filter((meal) => meal.is_on_the_diet);
      const mealsOutTheDiet = userMeals.filter((meal) => !meal.is_on_the_diet);
      let mealsBestSequence: number[] = [];
      let counter = 0;

      userMeals.forEach((meal, index) => {
        if (meal.is_on_the_diet) {
          counter += 1;

          if (userMeals.length - 1 === index) {
            mealsBestSequence.push(counter);
          }
        } else {
          mealsBestSequence.push(counter);
          counter = 0;
        }
      });

      return {
        metrics: {
          meals_total: userMeals.length,
          meals_total_on_the_diet: mealsOnTheDiet.length,
          meals_total_out_the_diet: mealsOutTheDiet.length,
          meals_best_sequence: Math.max(...mealsBestSequence),
        },
      };
    }
  );
};
