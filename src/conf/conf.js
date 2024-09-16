const {Sequelize} = require("sequelize")
const nodeMailer = require("nodemailer")


require("dotenv").config();
const HOST = process.env.HOST;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DIALECT = process.env.DIALECT;
const APPLICATION_PASSWORD = process.env.APPLICATION_PASSWORD;
const USER = process.env.USER;


const sequelize = new Sequelize(DATABASE_NAME,DATABASE_USER,DATABASE_PASSWORD, {
    host:HOST,
    dialect:DIALECT,
    logging: process.env.SQL_LOGGING == "true"
})

const transport = nodeMailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth: {
        user:USER,
        pass: APPLICATION_PASSWORD
    }

})


module.exports = {sequelize, transport}