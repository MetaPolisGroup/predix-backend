import mongoose from "mongoose";
export declare const databaseProvider: {
    provide: string;
    userFactory: () => Promise<typeof mongoose>;
}[];
