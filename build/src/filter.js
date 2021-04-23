"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // HTTP methods that will be handled by the recovery system.
    allowedMethod: function (method) { return method != "GET"; },
    // Routes that will be handeled by the recovery system.
    allowedRoute: function (route) { return true; },
    // HTTP response codes that will be handeled by the recovery system.
    allowedHTTPCode: function (code) { return code >= 500; }
};
//# sourceMappingURL=filter.js.map