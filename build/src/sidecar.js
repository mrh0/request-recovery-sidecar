"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var httpProxy = require("http-proxy");
var proxy = httpProxy.createProxyServer();
proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log("RES:", res.statusCode);
});
app.all('/*', function (req, res) {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});
app.listen(process.env.PORT || 80);
//# sourceMappingURL=sidecar.js.map