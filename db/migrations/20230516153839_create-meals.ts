import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();

    table.string("user_id").notNullable();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.string("date_meal").notNullable();
    table.string("hour_meal").notNullable();
    table.boolean("is_on_the_diet").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
