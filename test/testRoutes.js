const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
module.exports.app = app;

app.post("/commit", async (req, res) => {
    console.log("POST", "commit", "begin");

    if(process.env.TEST_FAIL) {
        res.sendStatus(500);
        return;
    }

    res.json({accepted: true});
    console.log("POST", "commit", "end");
});

app.get("/error", async (req, res) => {
    res.sendStatus(500);
});