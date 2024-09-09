const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../conf/conf");
const User = require("./user.model");
const { text } = require("express");

class Reservation extends Model {}

Reservation.init(
  {
    reservation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    people: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      allowNull: false,
    },
    note: {
      type:DataTypes.TEXT,
      allowNull:true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
  },
  {
    sequelize,
    modelName: "Reservation",
  }
);



module.exports = Reservation;
