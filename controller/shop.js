const User = require("../model/user");
const Products = require("../model/product");
const Order = require("../model/order");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: "587",
  auth: {
    user: "locntfx20150@funix.edu.vn",
    pass: "rWcTNTcfV390",
  },
});
exports.addToCart = (req, res, next) => {
  console.log(req.query);
  const prodId = req.query.idProduct;
  const userId = req.query.idUser;
  const count = req.query.count;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to login" });
        return;
      }
      console.log(user);
      Products.findById(prodId)
        .then((product) => {
          console.log(product);
          return user.addToCart(product, count);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getCart = (req, res, next) => {
  const id = req.query.idUser;
  User.findById(id)
    .populate("cart.items.productId")
    .then((cart) => {
      if (!cart) {
        res.status(401).json({ message: "you need to Login" });
        return;
      }
      return res.status(200).json(cart.cart.items);
    });
};

exports.postOrder = (req, res, next) => {
  const userId = req.body.user.idUser;
  const phone = req.body.user.phone;
  const address = req.body.user.address;
  const fullname = req.body.user.fullname;
  const email = req.body.user.email;

  User.findById(userId)
    .populate("cart.items.productId")
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to Login" });
        return;
      }
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      Order.findOne()
        .populate("user.userId")
        .populate("products.product")
        .then((cart) => {
          if (cart.user.userId._id.toString() === userId) {
            cart.products = cart.products.concat(products);
            res.status(200).json({ message: "ORDER SUCCESS!!" });
            return cart.save();
          } else {
            const order = new Order({
              user: {
                address: req.body.user.address,
                userId: userId,
              },
              products: products,
            });
            res.status(200).json({ message: "ORDER SUCCESS!!" });

            return order.save();
          }
        })
        .then((el) => {
          let sum = 0;
          products.map((value) => {
            return (sum +=
              parseInt(value.product.price) * parseInt(value.quantity));
          });
          return transporter
            .sendMail({
              to: email,
              from: "locntfx20150@funix.edu.vn",
              subject: "Email thông báo!",
              text: "Xin chao",
              html: `<h1>Xin chao ${fullname}</h1>
            <p>Phone:${phone}</p>
            <p>Address:${address}</p>
            <table><thead><tr><th><p>Ten San Pham</p></th><th><p>hinh anh</p></th><th><p>Gia</p></th><th><p>so luong</p></th><th><p>Thanh tien</p></th></tr></thead><tbody>${products.map(
              (el) => {
                return `<tr><td><p>${el.product.name}</p></td><td><img src=${
                  el.product.img1
                } alt='...' width=70></img></td><td><p>${
                  el.product.price
                } VND</p></td><td><p>${el.quantity}</p></td><td><p>${
                  parseInt(+el.product.price) * parseInt(el.quantity)
                } VND</p></td><tr>`;
              }
            )}</tbody><table>
            <h1>Tong Thanh Toan</h1>
            <h1>${sum} VND</h1>
            </br>
            <h1>Cam On Ban!</h1>
           `,
            })
            .then()
            .catch((er) => console.log(er));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.query.idUser })
    .populate("user.userId")
    .populate("products")
    .then((orders) => {
      if (!orders) {
        res.status(401).json({ message: "you need to Login" });
      }
      const data = JSON.stringify(orders);

      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
};

exports.historiesDetail = (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  Order.findById(id)
    .populate("user.userId")
    .populate("products")
    .then((orders) => {
      /*  const data = JSON.stringify(orders); */
      let sub_total = 0;
      orders.products.map((el) => {
        sub_total += parseInt(+el.product.price) * parseInt(el.quantity);
      });
      return res.status(200).json({
        total: sub_total,
        user: orders.user,
        product: orders.products,
      });
    })
    .catch((err) => console.log(err));
};

exports.deleteCart = (req, res, next) => {
  const prodId = req.query.idProduct;
  const userId = req.query.idUser;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to signup" });
        return;
      }
      console.log(user);
      Products.findById(prodId)
        .then((product) => {
          console.log(product);
          return user.removeFromCart(prodId);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};
