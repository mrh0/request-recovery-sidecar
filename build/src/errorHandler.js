"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var recover_1 = require("./recover");
function isErrorCode(code) {
    return code >= 500;
}
function isValidMethod(method) {
    return method != "GET";
}
function handler(body, req, res, error) {
    if (!isErrorCode(error))
        return;
    if (!isValidMethod(req.method))
        return;
    var p = {
        headers: req.headers,
        method: req.method,
        body: body,
        retries: 0,
        route: req.url,
        error: error
    };
    console.log("HANDLER", p);
    recover_1.push(process.env.NAME, p);
}
exports.default = handler;
//# sourceMappingURL=errorHandler.js.map