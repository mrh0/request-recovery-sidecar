import express = require('express');
import httpProxy = require('http-proxy');
import handler from "./errorHandler";

// Create proxy server.
const app = express();
const proxy = httpProxy.createProxyServer();

// JSON parser.
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Proxy request.
proxy.on('proxyReq', (proxyReq, req, res) => {
    let bodyData = JSON.stringify(req["body"]);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
});

// Proxy response.
proxy.on('proxyRes', (proxyRes, req, res) => {
    handler(req["body"], req, res, proxyRes.statusCode);
});

// Proxy error.
proxy.on('error', (error, req, res) => {
    handler(req["body"], req, res, 503);
})

// All proxy requests.
app.all('*', (req, res) => {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});

// Start proxy.
app.listen(process.env.PORT || 80, () => console.info("Started proxy", process.env.PORT || 80, "->", process.env.TARGET));