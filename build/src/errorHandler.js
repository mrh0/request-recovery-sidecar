"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var recover_1 = require("./recover");
function isErrorCode(code) {
    return code >= 500;
}
function handler(body, req, res) {
    if (!isErrorCode(res.statusCode))
        return;
    var p = {
        headers: req.headers,
        method: req.method,
        body: body,
        retries: 0,
        route: req.url,
        error: res.statusCode
    };
    console.log(p);
    recover_1.push(process.env.NAME, p);
}
exports.default = handler;
//# sourceMappingURL=errorHandler.js.map