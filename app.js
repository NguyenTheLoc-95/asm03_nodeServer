const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const User = require("./model/user");
const errorController = require("./controller/error");
const compression = require("compression");
require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");

const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PWD}@cluster0.w6b2e9t.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

const store = new mongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const productRoute = require("./route/product");
const userRoute = require("./route/user");
const shopRoute = require("./route/shop");
const chatRoute = require("./route/chat");


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./Images");
  },
  filename: (req, file, cb) => {
    return cb(null, Date.now() + "_" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(express.json());
app.use(cors());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("image")
);
app.use("/Images", express.static(path.join(__dirname, "./Images")));
app.use(compression());
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
    store: store,
  })
);

app.use("/user", userRoute);
app.use(shopRoute);
app.use("/products", productRoute);
app.use("/chatrooms", chatRoute);
app.use(errorController.get404);
const server = http.createServer(app);
const io = new Server(server, {
 
  cors: {
    origin: ["http://localhost:3000","http://localhost:3001"],
    methods: ["GET", "POST"],
  },
 

});


io.on("connection", (socket) => {
  socket.on("join_room",(id)=>{
    socket.join(id);
   
  });
  socket.on("send_message",(data)=>{
   
    socket.to(data.roomId).emit("receive_message",data);
  });

  socket.on("disconnect",()=>{
    console.log(`disconnect: ${socket.id}`)
  })
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    server.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
