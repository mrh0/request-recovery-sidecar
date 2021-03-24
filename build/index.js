"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
if (process.argv.length > 1)
    process.env.PORT = process.argv[2];
if (process.argv.length > 2)
    process.env.TARGET = process.argv[3];
console.log("Started proxy", process.env.PORT, "->", process.env.TARGET);
require("./src/sidecar");
//# sourceMappingURL=index.js.map