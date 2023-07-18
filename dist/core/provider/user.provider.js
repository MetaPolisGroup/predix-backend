"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProviders = void 0;
const user_schema_1 = require("../schema/user.schema");
exports.UserProviders = [
    {
        provide: "USER_MODEL",
        useFactory: (connection) => connection.model("User", user_schema_1.UserSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];
//# sourceMappingURL=user.provider.js.map