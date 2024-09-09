const Joi = require("joi");

const EMAIL_MAX_LENGTH = 200;
const PASSWORD_MIN_LENGTH = 8;
const NAME_LENGTH = 150;

const registerValidator = Joi.object({
  name: Joi.string().max(NAME_LENGTH).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must have exactly 9 digits.",
      "any.required": "Phone number is required"
    }),
  email: Joi.string().email().max(EMAIL_MAX_LENGTH).required().messages({
    "string.email":"Incorrect email format",
    "string.max":`The email must be maximum ${EMAIL_MAX_LENGTH}`,
    "any.require":"The email must be required to registe your account"
  }),
  born: Joi.date().required().messages({
    "any.required":"The born date must be required to register your account"
  }),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).required().messages({
    "string.min": "The must be minimum 8 characters",
    "any.required":"The password must be required to register your account"
  }),
});


const loginValidator = Joi.object({
  email:Joi.string().required().messages({
    "any.required": "Email is required to log in"
  }),
  password:Joi.string().required().messages({
    "any.required": "Password is required to log in"
  })
})

const changePasswordValidator = Joi.object({
  password: Joi.string().required().messages({
    "any.require":"Password must be require to change the password"
  }),
  newPassword: Joi.string().min(PASSWORD_MIN_LENGTH).required().messages({
    "string.min":"The new password must be minimum 8 characters",
    "any.required": "The new password must be require to change the password"
  })
})

const reservationValidator = Joi.object({
  people: Joi.number().min(1).max(4).required(),
  date: Joi.date().required().greater(new Date()),
  time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
})


const userValidator = Joi.object({
  name: Joi.string().max(NAME_LENGTH).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must have exactly 9 digits.",
      "any.required": "Phone number is required"
    }),
  email: Joi.string().email().max(EMAIL_MAX_LENGTH).required().messages({
    "string.email":"Incorrect email format",
    "string.max":`The email must be maximum ${EMAIL_MAX_LENGTH}`,
    "any.require":"The email must be required to registe your account"
  }),
  born: Joi.date().required().messages({
    "any.required":"The born date must be required to register your account"
  }),
})



module.exports = { registerValidator,loginValidator, changePasswordValidator,reservationValidator, userValidator };
