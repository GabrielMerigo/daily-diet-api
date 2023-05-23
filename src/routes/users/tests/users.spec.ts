import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../../../app";

describe("Users routes", () => {
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

  it("should create a new user", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      image: "/img",
      name: "Gabriel",
    });

    expect(createUserResponse.statusCode).toBe(201);
  });

  it("should list all users", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      image: "/img",
      name: "Gabriel",
    });

    const cookie = createUserResponse.get("Set-Cookie");

    const allUsers = await request(app.server)
      .get("/users")
      .set("Cookie", cookie)
      .expect(200);

    expect(allUsers.body.users[0]).toEqual(
      expect.objectContaining({
        name: "Gabriel",
        image: "/img",
      })
    );

    expect(allUsers.body.users).toHaveLength(1);
  });
});
