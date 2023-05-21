import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../../../app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should create a new meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookie = createUserResponse.get("Set-Cookie");

    const body = {
      name: "Almoço",
      description: "Comi uma carne com arroz",
      date_meal: "12/12/2022",
      hour_meal: "12:00",
      is_on_the_diet: true,
    };

    const response = await request(app.server)
      .post("/meals")
      .set("Cookie", cookie)
      .send(body);

    expect(response.statusCode).toEqual(201);
  });

  it("should get all meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    const response = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ meals: [] });
  });

  it("should get a meal by id", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookie = createUserResponse.get("Set-Cookie");

    const body = {
      name: "Almoço",
      description: "Comi uma carne com arroz",
      date_meal: "12/12/2022",
      hour_meal: "12:00",
      is_on_the_diet: true,
    };

    await request(app.server).post("/meals").set("Cookie", cookie).send(body);

    const allMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookie);

    const getMealResponse = await request(app.server)
      .get(`/meals/${allMealsResponse.body.meals[0].id}`)
      .set("Cookie", cookie)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "Almoço",
        description: "Comi uma carne com arroz",
        date_meal: "12/12/2022",
        hour_meal: "12:00",
        is_on_the_diet: true,
      })
    );
  });

  it("should delete a meal by id", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookie = createUserResponse.get("Set-Cookie");

    const body = {
      name: "Almoço",
      description: "Comi uma carne com arroz",
      date_meal: "12/12/2022",
      hour_meal: "12:00",
      is_on_the_diet: true,
    };

    await request(app.server).post("/meals").set("Cookie", cookie).send(body);

    const allMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookie);

    expect(allMealsResponse.body.meals).toHaveLength(1);

    await request(app.server)
      .delete(`/meals/${allMealsResponse.body.meals[0].id}`)
      .set("Cookie", cookie)
      .expect(204);

    const allMealsToSeeDeletedMeal = await request(app.server)
      .get("/meals")
      .set("Cookie", cookie);

    expect(allMealsToSeeDeletedMeal.body.meals).toEqual([]);
  });
});
