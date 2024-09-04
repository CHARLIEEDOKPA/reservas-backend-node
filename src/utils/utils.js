
const {jwtDecode} = require("jwt-decode")


const getToken = (req) => {
    const auth = req.header("authorization")
    return auth.split(" ")[1]
  }


const decodeJWT = (token) => {
  return jwtDecode(token)
}



module.exports = {getToken, decodeJWT}