"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWithRetries = exports.getLen = exports.recover = exports.pop = exports.push = void 0;
var Redis = require("ioredis");
var fetch = require("node-fetch");
// Max number of requests in a recovery batch.
var max_batch = parseInt(process.env.RECOVER_BATCH);
// Max number of failed recovers for a request before it is discarded.
var max_retries = parseInt(process.env.MAX_RETRIES);
// docker run -p 6379:6379 redis
var redis = new Redis(process.env.REDIS_PORT);
/**
 * @public Add a request to the database.
 * @argument service name
 */
function push(name, packet) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, redis.lpush(name, JSON.stringify(packet))];
        });
    });
}
exports.push = push;
/**
 * @public Get the first stored request.
 * @argument service name
 */
function pop(name) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, redis.lpop(name)];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            }
        });
    });
}
exports.pop = pop;
/**
 * @public Trigger the recovery process.
 * @argument service name
 */
function recover(name) {
    return __awaiter(this, void 0, void 0, function () {
        var count, failed, b, batch;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("LOG", name, "Recovery triggered");
                    return [4 /*yield*/, redis.llen(name)];
                case 1:
                    count = _b.sent();
                    failed = 0;
                    _b.label = 2;
                case 2:
                    if (!(count > 0)) return [3 /*break*/, 4];
                    b = 0;
                    batch = [];
                    while (count-- && b++ < max_batch)
                        batch.push(popAndSend(name));
                    return [4 /*yield*/, Promise.all(batch)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 2];
                case 4:
                    _a = { before: count };
                    return [4 /*yield*/, redis.llen(name)];
                case 5: return [2 /*return*/, (_a.now = _b.sent(), _a.failed = failed, _a)];
            }
        });
    });
}
exports.recover = recover;
/**
 * @public Get number of requests in the database.
 * @argument service name
 */
function getLen(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, redis.llen(name)];
        });
    });
}
exports.getLen = getLen;
// Sends stored requests.
function popAndSend(name) {
    return __awaiter(this, void 0, void 0, function () {
        var failed, p, err_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    failed = 0;
                    return [4 /*yield*/, pop(name)];
                case 1:
                    p = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 12]);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 7]);
                    return [4 /*yield*/, send(p)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _a.sent();
                    return [4 /*yield*/, sendWithRetries(p)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7:
                    if (process.env.DEBUG == "true")
                        console.log("DEBUG", "Sending http request using method", p.method);
                    return [3 /*break*/, 12];
                case 8:
                    e_1 = _a.sent();
                    p.retries++;
                    if (!(p.retries < max_retries)) return [3 /*break*/, 10];
                    return [4 /*yield*/, push(name, p)];
                case 9:
                    _a.sent();
                    console.log("LOG", "Error when recovering request", e_1);
                    return [3 /*break*/, 11];
                case 10:
                    console.error("ERROR", "Failed to recover (discarded request):", e_1, JSON.stringify(p));
                    failed++;
                    _a.label = 11;
                case 11: return [3 /*break*/, 12];
                case 12: return [2 /*return*/, { failed: failed }];
            }
        });
    });
}
function sendWithRetries(p) {
    return __awaiter(this, void 0, void 0, function () {
        var i, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = parseInt(process.env.RETRIES);
                    _a.label = 1;
                case 1:
                    if (!(i > 0)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, send(p)];
                case 3:
                    _a.sent();
                    if (process.env.DEBUG == "true")
                        console.log("DEBUG", "Retried failed request", p.method);
                    return [2 /*return*/];
                case 4:
                    e_2 = _a.sent();
                    i--;
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 1];
                case 6: throw "failed retries";
            }
        });
    });
}
exports.sendWithRetries = sendWithRetries;
function send(p) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, fetch(process.env.TARGET + p.route, { method: p.method, headers: p.headers, body: JSON.stringify(p.body) })];
        });
    });
}
//# sourceMappingURL=recover.js.map