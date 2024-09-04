const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../conf/conf");
const bcrypt = require("bcrypt")

class User extends Model {}

const hashPassword = async (user) => {

  if (user.password) {

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt)
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    born: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
    },
    rol: {
      type: DataTypes.STRING(10),
      allowNull:false
    }
  },
  {
    sequelize,
    modelName: "User",
    hooks: {
      beforeCreate:hashPassword,
      beforeUpdate:hashPassword
    }
  }
);

const sync = async () => {
  try {
    await User.sync({ force: false, alter: false });
  } catch (error) {
    console.log(error);
  }
};

sync();

module.exports = User;
