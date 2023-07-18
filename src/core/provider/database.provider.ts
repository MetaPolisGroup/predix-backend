import mongoose from "mongoose";

export const databaseProvider = [
  {
    provide: "DATABASE_CONNECTION",
    userFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(`${process.env.MONGO_DB_HOST}`, {
        dbName: process.env.MONGO_DB,
        user: process.env.user,
        pass: process.env.password,
      }),
  },
];
