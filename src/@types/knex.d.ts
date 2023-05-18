declare module "knex/types/tables" {
  export interface Tables {
    meals: {
      name: string;
      description: string;
      date: string;
      isOnTheDiet: boolean;
    };
  }
}
