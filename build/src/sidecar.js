"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var httpProxy = require("http-proxy");
var errorHandler_1 = require("./errorHandler");
var app = express();
var proxy = httpProxy.createProxyServer();
app.use(express.json());
//app.use(express.text());
app.use(express.urlencoded({ extended: false }));
proxy.on('proxyReq', function (proxyReq, req, res, options) {
    var bodyData = JSON.stringify(req["body"]);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // Stream the content
    proxyReq.write(bodyData);
    //proxyReq.end();
});
/*proxy.on('proxyReq', function (proxyReq, req, res) {
    let body: string[] = [];
    proxyReq.on('data', (chunk) => {
        body.push(chunk);
    });
    proxyReq.on('end', () => {
        body.join("");
    });
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    let body: string[] = [];
    proxyRes.on('data', (chunk) => {
        body.push(chunk);
    });
    proxyRes.on('end', () => {
        handler(body.join(""), req, res);
    });
});*/
app.all('*', function (req, res) {
    console.log("BODY", req.body);
    errorHandler_1.default(req.body, req, res);
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});
app.listen(process.env.PORT || 80);
//# sourceMappingURL=sidecar.js.map