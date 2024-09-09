require("dotenv").config();
const jwt = require("jsonwebtoken");
const {decodeJWT,getToken} =  require("../utils/utils")
const Users = require("../model/user.model")

const returnErrorResponse = (res, status, message) =>
  res.status(status).json({ status: status, message: `${message}` });



const checkJWT = (req, res, next) => {
  const authorization = req.header("authorization");
  if (authorization) {
    const token = getToken(req)
    const secret = process.env.SECRET;
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return returnErrorResponse(
          res,
          401,
          "Incorrect or expired token. Please try again to log in"
        );
      }
      return next();
    });
  } else {
    return returnErrorResponse(res, 401, "Access denied");
  }
};

const isRoot = (req,res,next) => {
  const token = getToken(req)
  const {rol} = decodeJWT(token)
  
  rol === "root" ? next() : returnErrorResponse(res,401,"Access denied")
}

const notRoot = (req,res,next) => {

  const token = getToken(req)
  const {rol} = decodeJWT(token)
  console.log(rol);

  return rol !== "root" ? next() : returnErrorResponse(res,401,"Access denied")
}

const isClient = (req,res,next) => {
  const token = getToken(req)
  const {rol} = decodeJWT(token)

  rol === "client" ? next() : returnErrorResponse(res,401,"Access denied")
}

const isAdmin = (req,res,next) => {
  const token = getToken(req)
  const {rol} = decodeJWT(token)

  rol === "admin" ? next() : returnErrorResponse(res,401,"Access denied")
}

const userExists = async(req,res,next) => {
  const token = getToken(req)
  const {user_id,email} = decodeJWT(token)
  const user = await Users.findOne({
    where: {
      user_id:user_id,
      email:email
    }
  })

  user? next(): res.status(500).json({status:500,message:"User not registered"})

}

module.exports = { checkJWT,isRoot,userExists,notRoot,isClient,isAdmin };
