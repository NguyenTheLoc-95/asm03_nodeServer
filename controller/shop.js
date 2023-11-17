const User = require("../model/user");
const Products = require("../model/product");
const Order = require("../model/order");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: "587",

  auth: {
    user: "locntfx20150@funix.edu.vn",
    pass: "Locnguyen@95",
  },
});
exports.addToCart = (req, res, next) => {
  const prodId = req.query.idProduct;
  const userId = req?.user?._id;
  const count = req.query.count;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to login" });
        return;
      }

      Products.findById(prodId)
        .then((product) => {
          res.status(200).json({ message: "ADD SUCCESS" });
          return user.addToCart(product, count);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getCart = (req, res, next) => {
  const id = req?.user?._id;
  /* if (!id) {
    res.status(401).json({ message: "you need to Login" });
    return;
  } */
  User.findById(id)
    .populate("cart.items.productId")
    .then((cart) => {
      if (!cart) {
        res.status(401).json({ message: "Bạn đã hết phiên xin đăng nhập lại!" });
        return;
      }
      return res.status(200).json(cart.cart.items);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updateCart = (req, res, next) => {
  const prodId = req.query.idProduct;

  const userId = req?.user?._id;
  const count = req.query.count;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to login" });
        return;
      }

      Products.findById(prodId)
        .then((product) => {
          res.status(200).json({ message: "FIX SUCCESS" });
          return user.addToCart(product, count);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  const userId = req?.user?._id;
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
      Order.findOne({ user: userId })
        .populate("user")
        .populate("products.product")
        .then((cart) => {
          let order;
          if (!cart) {
            order = new Order({
              phone: phone,
              address: address,
              user: user,
              products: products,
            });
            res.status(200).json({ message: "ORDER SUCCESS!!" });
            order.save();
            return;
          }
          if (cart.user._id.toString() === userId.toString()) {
            cart.products = cart.products.concat(products);
            res.status(200).json({ message: "ORDER SUCCESS!!" });
            return cart.save();
          }
        })
        .then((el) => {
          let sum = 0;
          products.map(
            (value) =>
              (sum += parseInt(value.product.price) * parseInt(value.quantity))
          );
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
  Order.findOne({ user: req?.user?._id })
    .populate("user")
    .populate("products")
    .then((orders) => {
      if (!orders) {
        res.status(401).json({ message: "you need to Login" });
        return;
      }

      const data = JSON.stringify(orders);

      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
};

exports.historiesDetail = (req, res, next) => {
  const id = req.params.id;
  const user = req?.user?._id;

  Order.findOne({ user: user })
    .populate("user")
    .then((orders) => {
      if (!orders) {
        res.status(401).json({ message: "You need to Login!" });
        return;
      }
      /*  const data = JSON.stringify(orders); */
      let sub_total = 0;
      orders.products.map((el) => {
        sub_total += parseInt(+el.product.price) * parseInt(el.quantity);
      });
      const product = orders.products.find(
        (el) => el.product._id.toString() === id
      );

      return res.status(200).json({
        total: sub_total,
        user: orders.user,
        product: product,
        address: orders.address,
      });
    })
    .catch((err) => console.log(err));
};

exports.deleteCart = (req, res, next) => {
  const prodId = req.query.idProduct;
  const userId = req?.user?._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to signin" });
        return;
      }
      res.status(200).json({ message: "DELETE PRODUCT SUCCESS" });
      return user.removeFromCart(prodId);
      /*  Products.findById(prodId)
        .then((product) => {
          
        })
        .catch((err) => console.log(err)); */
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.historiesAll = (req, res, next) => {
  const userId = req.query.idUser;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "you need to signin" });
        return;
      }
      Order.find()
        .populate("user")
        .then((order) => {
          let test = [];

          const allUser = order.map((el) => {
            const test2 = el.products.map((e) => {
              test.push({
                user: el.user,
                totalPrice: parseInt(+e.product.price) * parseInt(e.quantity),
                address: el.address,
                phone: el.phone,
              });
            });
          });

          res.status(200).json(test);
        })
        .catch((er) => console.log(er));
    })
    .catch((er) => console.log(er));
};
