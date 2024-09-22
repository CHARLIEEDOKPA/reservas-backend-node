const router = require("express").Router();
const Users = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  checkJWT,
  isRoot,
  userExists,
  notRoot,
} = require("../middlewares/middlewares");
require("dotenv").config();

const { getToken, decodeJWT, validate } = require("../utils/utils");

const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  userValidator,
} = require("../validator/validators");
const { Op } = require("sequelize");

const JWT_EXPIRATION_TIME = "1440m";
const JWT_ALGORITHM = "HS256";

const createToken = (user) => {
  const userCopy = { ...user };
  removeSensitiveData(userCopy);

  const secretKey = process.env.SECRET;

  return jwt.sign(userCopy, secretKey, {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRATION_TIME,
  });
};

const registerAccount = async (req, res, admin = false) => {
  const body = req.body;
  const error = validate(body, registerValidator);
  if (error) return res.status(400).json(error);
  const email = body.email;
  const existedUser = await Users.findOne({
    where: {
      email: email,
    },
  });
  if (existedUser) {
    return res
      .status(400)
      .json({ status: 400, message: `Email ${email} already exists` });
  }
  body.rol = admin ? "admin" : "client";

  await Users.create(body);

  return res
    .status(201)
    .json({ status: 201, message: "User registered successfully" });
};

const removeSensitiveData = (user) => {
  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;
};

const returnUnauthorizedResponse = (res) =>
  res
    .status(401)
    .json({ status: 401, message: "Invalid credentials. Try again" });

router.post("/register", async (req, res) => {
  registerAccount(req, res);
});

router.post("/register-admin", checkJWT, isRoot, userExists, (req, res) => {
  registerAccount(req, res, true);
});

router.post("/login", async (req, res) => {
  const body = req.body;
  const error = validate(body, loginValidator);

  if (error) return res.status(400).json(error);

  const { email, password } = body;
  const user = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    return returnUnauthorizedResponse(res);
  }
  const authenticate = await bcrypt.compare(password, user.password);

  if (!authenticate) {
    return returnUnauthorizedResponse(res);
  }

  const userData = user.dataValues;

  const token = createToken(userData);

  return res.json({
    status: 200,
    message: "Successfully logged in",
    body: token,
  });
});

router.put("/change-password", checkJWT, userExists, async (req, res) => {
  const body = req.body;
  const error = validate(body, changePasswordValidator);

  if (error) return res.status(400).json(error);
  const { password, newPassword } = body;

  const token = getToken(req);
  const { user_id } = decodeJWT(token);

  const user = await Users.findOne({
    where: {
      user_id: user_id,
    },
  });

  const authenticate = await bcrypt.compare(password, user.password);

  if (!authenticate)
    return res
      .status(401)
      .json({ message: "Invalid credentials. Please try again" });

 
  user.password = newPassword
  await user.save()


  return res.json({
    status: 200,
    message: "The password has successfully changed",
  });
});

router.put("/:id", checkJWT, notRoot, userExists, async (req, res) => {
  const token = getToken(req);
  const id = parseInt(req.params.id);
  const { user_id, email } = decodeJWT(token);

  console.log(email);

  if (id !== user_id) {
    return res
      .status(401)
      .json({ status: 401, message: "You cannot edit this account" });
  }

  const body = req.body;

  const error = validate(body, userValidator);

  if (error) return res.status(400).json(error);

  const bodyEmail = body.email;

  const existedUser = await Users.findOne({
    where: {
      email: bodyEmail,
      user_id: { [Op.ne]: id } 
    }
  });

  if (existedUser) {
    return res
      .status(400)
      .json({ status: 400, message: `The email ${bodyEmail} already exists` });
  }

  await Users.update(body, {
    where: {
      user_id: id,
    },
  });

  const user = await Users.findOne({
    where: {
      user_id: id,
    },
  });

  const userData = user.dataValues
  const newToken = createToken(userData);

  return res.json({
    status: 200,
    message: "Your account is successfully updated",
    body: newToken,
  });
});

router.get("/users",checkJWT,userExists,isRoot,async (req,res) => {
  const users = await Users.findAll({
    where: {
      rol : {[Op.ne]:"root"}
    }
  })
  const mappedUsers =  users.map(u => {
    delete u.password
    return u
  })

  return res.json({status:200,body:mappedUsers})
})


module.exports = router;
