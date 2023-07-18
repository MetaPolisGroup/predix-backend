import { Connection } from "mongoose";
import { CashHistorySchema } from "../schema/cash-history.schema";

export const cashHistoryProviders = [
  {
    provide: "CASH_HISTORY_MODEL",
    useFactory: (connection: Connection) => connection.model("CashHistory", CashHistorySchema),
    inject: ["DATABASE_CONNECTION"],
  },
];
