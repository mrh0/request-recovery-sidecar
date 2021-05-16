const express = require("express");
const cors = require("cors");
const flag = require("./flag");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
module.exports = app;

app.post("/flag", async (req, res) => {
    if(process.env.TEST_FAIL == "true") {
        res.sendStatus(500);
        return;
    }
    res.json({accepted: true, flag: flag.capture()});
});

app.get("/error", async (req, res) => {
    res.sendStatus(500);
});