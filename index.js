require("dotenv").config();
const express = require("express");
const {recover, getLen} = require("./src/recover");

if(process.argv.length > 2)
    process.env.PORT = process.argv[2];
if(process.argv.length > 3)
    process.env.TARGET = process.argv[3];

require("./src/sidecar");

// Create controller server.
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// GET : Test control server.
app.get('/ping', (req, res) => res.json({accepted: true, message: "pong", request: req.body}));

// GET : Triggers the recovery process.
app.get('/recover', async (req, res) => {
    res.json({accepted: true, len: await getLen(process.env.NAME)});

    recover(process.env.NAME);
});

app.listen(process.env.CONTROL_PORT || 5001, () => console.info("Started control server on port", process.env.CONTROL_PORT || 5001));
