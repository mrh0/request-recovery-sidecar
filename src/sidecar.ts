import express = require('express');
import httpProxy = require('http-proxy');
import handler from "./errorHandler";

const app = express();
const proxy = httpProxy.createProxyServer();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

proxy.on('proxyReq', function(proxyReq, req, res) {
    let bodyData = JSON.stringify(req["body"]);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
});

proxy.on('proxyRes', function(proxyRes, req, res) {
    //console.log("BODY", req["body"])
    handler(req["body"], req, res, proxyRes);
});

app.all('*', (req, res) => {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});

app.listen(process.env.PORT || 80);