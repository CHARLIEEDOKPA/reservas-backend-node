const readline = require("readline-sync");
const Users = require("../model/user.model");
const sync = require("../db/sync-db");
require("colors");

const syncDatabase = async () => {
  await sync();
};

const addRootUser = async (user) => {
  const userExists = await Users.findOne({
    where: {
      email: user.email,
    },
  });

  if (userExists) {
    console.log(`Email ${user.email} already exists. Please try again`.red);
    return false;
  }

  const userCopy = { ...user, rol: "root" };
  await Users.create(userCopy);

  console.log("Your user root has been successfully registered".green);

  return true;
};

const main = async () => {
  let name, phone, email, password, born, ok;
  do {
    do {
      name = readline.question("Name: ".yellow);
    } while (name.length < 4);

    do {
      phone = readline.question("Phone: ".yellow);
    } while (phone.length < 9 || phone.length > 9 || isNaN(+phone));

    email = readline.questionEMail("Email: ".yellow);

    let passwordFormatError;
    do {
      password = readline.question("Password: ".yellow);
      passwordFormatError = password.length < 8;

      if (passwordFormatError) {
        console.log("The password must be minimum 8 characters".red);
      }
    } while (passwordFormatError);
    let incorrectDateFormat;
    do {
      born = readline.question("Born date: ".yellow);
      let date = new Date(born);
      incorrectDateFormat = isNaN(date.valueOf());

      if (incorrectDateFormat) {
        console.log("Wrong date format. Please try again".red);
      }
    } while (incorrectDateFormat);

    let user = { name, phone, email, password, born };
    ok = await addRootUser(user);
  } while (!ok);
};

const app = async () => {
  await syncDatabase();
  await main();
};

app();
