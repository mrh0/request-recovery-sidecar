"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var httpProxy = require("http-proxy");
var errorHandler_1 = require("./errorHandler");
// Create proxy server.
var app = express();
var proxy = httpProxy.createProxyServer();
// JSON parser.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Proxy request.
proxy.on('proxyReq', function (proxyReq, req, res) {
    var bodyData = JSON.stringify(req["body"]);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
});
// Proxy response.
proxy.on('proxyRes', function (proxyRes, req, res) {
    errorHandler_1.default(req["body"], req, res, proxyRes.statusCode);
});
// Proxy error.
proxy.on('error', function (error, req, res) {
    errorHandler_1.default(req["body"], req, res, 503);
});
// All proxy requests.
app.all('*', function (req, res) {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});
// Start proxy.
app.listen(process.env.PORT || 80, function () { return console.log("Started proxy", process.env.PORT || 80, "->", process.env.TARGET); });
//# sourceMappingURL=sidecar.js.map