const {Sequelize} = require("sequelize")

const HOST = `localhost`
const DATABASE_NAME = "reservations"
const DATABASE_USER = "root"
const DATABASE_PASSWORD = "12345678"
const DIALECT = "mysql"
require("dotenv").config()



const sequelize = new Sequelize(DATABASE_NAME,DATABASE_USER,DATABASE_PASSWORD, {
    host:HOST,
    dialect:DIALECT,
    logging: process.env.SQL_LOGGING == "true"
})

module.exports = {sequelize}