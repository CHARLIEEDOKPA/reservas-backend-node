const User = require("../model/user.model")
const Reservation = require("../model/reservation.model")

const sync = async () => {
    try {  
      await User.sync({ force: false, alter: false });
      await Reservation.sync({ force: false, alter: true });
    } catch (error) {
      console.log(error);
    }
  };

  
module.exports = sync