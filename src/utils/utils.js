
const {jwtDecode} = require("jwt-decode")


const getToken = (req) => {
    const auth = req.header("authorization")
    return auth.split(" ")[1]
  }


const decodeJWT = (token) => {
  return jwtDecode(token)
}


const validate = (body, validator) => {
  const result = validator.validate(body);
  if (result.error) {
    const message = result.error.details[0].message;
    console.log(result.error.details.map((errDetail) => errDetail.type));
    return { status: 400, message: message };
  }
};


module.exports = {getToken, decodeJWT, validate}