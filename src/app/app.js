const express = require("express");
const authRouter = require("../router/auth.router");
const morgan = require("morgan")
const app = express();

app.use(morgan("dev"))
app.use(express.json());
app.use("/auth",authRouter);

module.exports = app;
