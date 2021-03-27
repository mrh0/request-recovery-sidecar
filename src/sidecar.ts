import express = require('express');
import httpProxy = require('http-proxy');
import handler from "./errorHandler";

const app = express();
const proxy = httpProxy.createProxyServer();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

proxy.on('proxyReq', (proxyReq, req, res) => {
    let bodyData = JSON.stringify(req["body"]);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
});

proxy.on('proxyRes', (proxyRes, req, res) => {
    //console.log("BODY", req["body"])
    handler(req["body"], req, res, proxyRes.statusCode);
});

proxy.on('error', (error, req, res) => {
    handler(req["body"], req, res, 503);
})

app.all('*', (req, res) => {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});

app.listen(process.env.PORT || 80, () => console.log("Started proxy", process.env.PORT || 80, "->", process.env.TARGET));