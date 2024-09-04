const {Sequelize} = require("sequelize")

const HOST = `localhost`
const DATABASE_NAME = "reservations"
const DATABASE_USER = "root"
const DATABASE_PASSWORD = "12345678"
const DIALECT = "mysql"



const sequelize = new Sequelize(DATABASE_NAME,DATABASE_USER,DATABASE_PASSWORD, {
    host:HOST,
    dialect:DIALECT
})

module.exports = {sequelize}