import express = require('express');
import {push, pop, popAndSend} from "./recover";
import httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer();

function isErrorCode(code: number) {
    return code >= 500;
}

proxy.on('proxyRes', function (proxyRes, req, res) {

    console.log("RES:", res.statusCode);
});

app.all('/*', (req, res) => {
    proxy.web(req, res, { target: process.env.TARGET || 'http://localhost:80' });
});

app.listen(process.env.PORT || 80);