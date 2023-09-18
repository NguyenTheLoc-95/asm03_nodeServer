const express = require('express')
const userController = require('../controller/users');
const {body}=require('express-validator')
const User = require('../model/user')

const route = express.Router()
route.post('/signup', [
    body('user.fullname', 'Please enter a name')
      .trim().isAlphanumeric(),
      body('user.email').trim()
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
      console.log(value)
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      ,
    body(
      'user.password',
      'Please enter a password with only numbers and text and at least 6 characters.'
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body('user.phone', 'Please enter a number phone')
      .trim().isAlphanumeric().isFloat(),
     
  ], userController.postSignup);
route.post('/signin',
[
  body('user.email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('user.password', 'Password has to be valid with only numbers and text and at least 6 characters.')
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim()
], userController.postLogin)
route.post('/signinAdmin',
[
  body('user.email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('user.password', 'Password has to be valid with only numbers and text and at least 6 characters.')
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim()
], userController.postLoginAdmin);


module.exports =route;