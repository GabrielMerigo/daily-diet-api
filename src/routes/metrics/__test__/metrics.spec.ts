import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../../../app";

describe("Metrics routes", () => {
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

  it("should show metrics for an user", async () => {
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

    await request(app.server).post(`/meals`).set("Cookie", cookie).send(body);

    const getAllUsersResponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookie);

    const response = await request(app.server)
      .get(`/metrics/${getAllUsersResponse.body.users[0].id}`)
      .set("Cookie", cookie);

    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        meals_total: 1,
        meals_total_on_the_diet: 1,
        meals_total_out_the_diet: 0,
        meals_best_sequence: 1,
      })
    );
  });

  it("should show a best sequence with more than 1", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookie = createUserResponse.get("Set-Cookie");

    const bodies = [
      {
        name: "Almoço",
        description: "Comi uma carne com arroz",
        date_meal: "12/12/2022",
        hour_meal: "12:00",
        is_on_the_diet: true,
      },
      {
        name: "Janta",
        description: "Comi massa",
        date_meal: "12/12/2022",
        hour_meal: "23:00",
        is_on_the_diet: true,
      },
    ];

    for await (let body of bodies) {
      await request(app.server).post(`/meals`).set("Cookie", cookie).send(body);
    }

    const getAllUsersResponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookie);

    const response = await request(app.server)
      .get(`/metrics/${getAllUsersResponse.body.users[0].id}`)
      .set("Cookie", cookie);

    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        meals_total: 2,
        meals_total_on_the_diet: 2,
        meals_total_out_the_diet: 0,
        meals_best_sequence: 2,
      })
    );
  });

  it("should add a meal out the diet", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookie = createUserResponse.get("Set-Cookie");

    const bodies = [
      {
        name: "Almoço",
        description: "Comi uma carne com arroz",
        date_meal: "12/12/2022",
        hour_meal: "12:00",
        is_on_the_diet: true,
      },
      {
        name: "Janta",
        description: "Comi massa",
        date_meal: "12/12/2022",
        hour_meal: "23:00",
        is_on_the_diet: true,
      },
      {
        name: "Café",
        description: "X Burger",
        date_meal: "13/12/2022",
        hour_meal: "10:00",
        is_on_the_diet: false,
      },
    ];

    for await (let body of bodies) {
      await request(app.server).post(`/meals`).set("Cookie", cookie).send(body);
    }

    const getAllUsersResponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookie);

    const response = await request(app.server)
      .get(`/metrics/${getAllUsersResponse.body.users[0].id}`)
      .set("Cookie", cookie);

    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        meals_total: 3,
        meals_total_on_the_diet: 2,
        meals_total_out_the_diet: 1,
        meals_best_sequence: 2,
      })
    );
  });

  it("should restart the counter when enter a meal out the diet", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        image: "/img",
        name: "Gabriel",
      })
      .expect(201);

    const cookie = createUserResponse.get("Set-Cookie");

    const bodies = [
      {
        name: "Almoço",
        description: "Comi uma carne com arroz",
        date_meal: "12/12/2022",
        hour_meal: "12:00",
        is_on_the_diet: true,
      },
      {
        name: "Janta",
        description: "Comi massa",
        date_meal: "12/12/2022",
        hour_meal: "23:00",
        is_on_the_diet: true,
      },
      {
        name: "Café",
        description: "X Burger",
        date_meal: "13/12/2022",
        hour_meal: "10:00",
        is_on_the_diet: false,
      },
      {
        name: "Lanche da tarde",
        description: "Pãozinho",
        date_meal: "13/12/2022",
        hour_meal: "14:00",
        is_on_the_diet: true,
      },
      {
        name: "Janta",
        description: "Comi uns carbos",
        date_meal: "13/12/2022",
        hour_meal: "20:00",
        is_on_the_diet: true,
      },
      {
        name: "Café",
        description: "Aveia",
        date_meal: "15/12/2022",
        hour_meal: "06:00",
        is_on_the_diet: true,
      },
    ];

    for await (let body of bodies) {
      await request(app.server).post(`/meals`).set("Cookie", cookie).send(body);
    }

    const getAllUsersResponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookie);

    const response = await request(app.server)
      .get(`/metrics/${getAllUsersResponse.body.users[0].id}`)
      .set("Cookie", cookie);

    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        meals_total: 6,
        meals_total_on_the_diet: 5,
        meals_total_out_the_diet: 1,
        meals_best_sequence: 3,
      })
    );
  });
});
