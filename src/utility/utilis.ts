import Joi from 'joi';
import jwt from 'jsonwebtoken';


export const loginUserSchema = Joi.object().keys({
  email: Joi.string().trim().lowercase(),
  username: Joi.string().trim().lowercase(),
  password: Joi.string().required(),
});

export const generateToken = (user: Record<string, unknown>): unknown => {
  const passPhrase = process.env.JWT_SECRET as string;
  return jwt.sign(user, passPhrase, { expiresIn: '7d' });
};

export const registerUserSchema = Joi.object()
  .keys({
    firstname: Joi.string().trim().required(),
    lastname: Joi.string().trim().required(),
    username: Joi.string().trim().required(),
    email: Joi.string().trim().lowercase().required(),
    phoneNumber: Joi.string()
      .length(11)
      .pattern(/^[0-9]+$/)
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
    avatar: Joi.string(),
    isVerified: Joi.boolean(),
    confirmPassword: Joi.ref('password'),
  })
  .with('password', 'confirmPassword');

export const changePasswordSchema = Joi.object().keys({
  password: Joi.string().required(),
  confirmPassword: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .label('Confirm password')
    .messages({ 'any.only': '{{#label}} does not match' }),
})
.with('password', 'confirmPassword');

export const createAccountSchema = Joi.object().keys({
  bankName: Joi.string().trim().required(),
  accountNumber: Joi.string().trim().required().pattern(/^[0-9]+$/).length(10),
  accountName: Joi.string().trim().required(),
  walletBalance: Joi.number().min(0),
  userId: Joi.string().trim(),
});

export const transactionsSchema = Joi.object().keys({
  network: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  amount: Joi.string().required(),
  status: Joi.boolean(),
  userId: Joi.string(),
})

export const withdrawalSchema = Joi.object().keys({
  id: Joi.string(),
  amount: Joi.string().required(),
  status: Joi.boolean(),
  accountNumber:Joi.string().trim().required().pattern(/^[0-9]+$/).length(10),
  bankName: Joi.string().trim().required(),
  userId: Joi.string(),
  email: Joi.string(),
  bankCode: Joi.string(),
  password: Joi.string().required()
})


export const options = {
  abortEarly: false,
  errors: { 
    wrap: {
      label: '',
    },
  },
};


