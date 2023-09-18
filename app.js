const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const User = require("./model/user");
const errorController = require("./controller/error");
const compression = require('compression')

const MONGODB_URI =
`mongodb+srv://nguyentheloc250595:MJY5uCyzQfSSRbZg@cluster0.w6b2e9t.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

const store = new mongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const productRoute = require("./route/product");
const userRoute = require("./route/user");
const shopRoute = require("./route/shop");
app.use(express.json());
app.use(cors());
app.use(compression());
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
   store:store,

  })
);
app.use("/user", userRoute);
/* app.use((req, res, next) => {
  console.log(req.session);
  next();
   if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      console.log(req.user)
      next();
    })
    .catch(err => console.log(err)); 
}); */

app.use(shopRoute);
app.use("/products", productRoute);
app.use(errorController.get404);
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen( 5000);
  })
  .catch((err) => {
    console.log(err);
  });
