require("dotenv").config();
import express = require("express");
import {push, pop, recover, getLen} from "./src/recover";

if(process.argv.length > 1)
    process.env.PORT = process.argv[2];
if(process.argv.length > 2)
    process.env.TARGET = process.argv[3];

import "./src/sidecar";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/ping', (req, res) => res.json({accepted: true, message: "pong", request: req.body}));

app.get('/recover', async (req, res) => {
    res.json({accepted: true, len: await getLen(process.env.NAME)});

    recover(process.env.NAME);
});

app.listen(process.env.CONTROL_PORT || 5001, () => console.log("Started control server on port", process.env.CONTROL_PORT || 5001));
