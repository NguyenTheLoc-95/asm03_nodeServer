const User = require("../model/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");


exports.postSignup = (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    /*    console.log(errors.array()) */
    res.status(401).json({ message: errors.array()[0].msg });
    return;
  }
  const email = req.body.user.email;
  const password = req.body.user.password;
  const fullname = req.body.user.fullname;
  const phone = req.body.user.phone;

  bcrypt
    .hash(password, 12)
    .then((hashpw) => {
      const user = new User({
        email: email,
        fullname: fullname,
        password: hashpw,
        phone: phone,
        role:'client',
        cart: {
          items: [],
        },
      });
      res.status(200).json({ message: "SUCCESFULL" });
      return user.save();
    })
    .catch((err) => console.log(err));
};

exports.postLogin = (req, res, next) => {
  const email = req.body.user.email;
  const password = req.body.user.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    /*    console.log(errors.array()) */
    res.status(401).json({ message: errors.array()[0].msg });
    return;
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "not user" });
        return;
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (!doMatch) {
            res.status(401).json({ message: "The Password is not true" });
            return;
          }
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((err) => {
            res
              .status(200)
              .json({ message: "LOGGEDIN", user: req.session.user });
          });
        })
        .catch((er) => {
          console.log(er);
        });
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.postLoginAdmin = (req, res, next) => {
  const email = req.body.user.email;
  const password = req.body.user.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    /*    console.log(errors.array()) */
    res.status(401).json({ message: errors.array()[0].msg });
    return;
  }
  User.findOne({ email: email})
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "not found user" });
        return;
      };
      if(user.role==='client'){
        res.status(401).json({ message: "You are not Admin" });
        return;
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (!doMatch) {
            res.status(401).json({ message: "The Password is not true" });
            return;
          }
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((err) => {
            res
              .status(200)
              .json({ message: "LOGGEDIN", user: req.session.user });
          });
        })
        .catch((er) => {
          console.log(er);
        });
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
  });
};
