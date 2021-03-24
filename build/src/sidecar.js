"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var httpProxy = require("http-proxy");
var errorHandler_1 = require("./errorHandler");
var app = express();
var proxy = httpProxy.createProxyServer();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
proxy.on('proxyReq', function (proxyReq, req, res) {
    var bodyData = JSON.stringify(req["body"]);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
});
proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log("BODY", req["body"]);
    errorHandler_1.default(req["body"], req, res, proxyRes);
});
app.all('*', function (req, res) {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});
app.listen(process.env.PORT || 80);
//# sourceMappingURL=sidecar.js.map