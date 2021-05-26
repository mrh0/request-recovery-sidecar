const express = require('express');
const httpProxy = require('http-proxy');
const handler = require("./errorHandler");

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
proxy.on('proxyRes', async (proxyRes, req, res) => {
    if(await handler(req["body"], req, res, proxyRes.statusCode))
        res.status(proxyRes.statusCode).send();
});

// Proxy error.
proxy.on('error', async (error, req, res) => {
    if(await handler(req["body"], req, res, 503))
        res.status(503).send();
})

// All proxy requests.
app.all('*', (req, res) => {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});

// Start proxy.
app.listen(process.env.PORT || 80, () => console.info("Started proxy", process.env.PORT || 80, "->", process.env.TARGET));