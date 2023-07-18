"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductProviders = void 0;
const product_schema_1 = require("../schema/product.schema");
exports.ProductProviders = [
    {
        provide: "PRODUCT_MODEL",
        useFactory: (connection) => connection.model("Product", product_schema_1.ProductSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];
//# sourceMappingURL=product.provider.js.map