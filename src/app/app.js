const express = require("express");
const authRouter = require("../router/auth.router");
const reservationRouter = require("../router/reservation.router");
const morgan = require("morgan");
const app = express();
const sync = require("../db/sync-db");

sync();

app.use(morgan("dev"));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/reservations/", reservationRouter);

module.exports = app;
