import { Connection } from "mongoose";
import { UserSchema } from "../schema/user.schema";
import { PointHistorySchema } from "../schema/point-history.schema";

export const pointHistoryProviders = [
  {
    provide: "POINT_HISTORY_MODEL",
    useFactory: (connection: Connection) => connection.model("PointHistory", PointHistorySchema),
    inject: ["DATABASE_CONNECTION"],
  },
];
