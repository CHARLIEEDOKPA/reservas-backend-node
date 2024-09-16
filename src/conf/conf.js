const {Sequelize} = require("sequelize")
const nodeMailer = require("nodemailer")


const HOST = `localhost`
const DATABASE_NAME = "reservations"
const DATABASE_USER = "root"
const DATABASE_PASSWORD = "12345678"
const DIALECT = "mysql"
const APPLICATION_PASSWORD = "gcaz erdl ebmv nsuw"
const USER = "jnr.31gcharlieedokpa@gmail.com"
require("dotenv").config()



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