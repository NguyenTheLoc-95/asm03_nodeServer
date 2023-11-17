const Products = require("../model/product");

exports.getProducts = (req, res, next) => {
 console.log(req.session)
  Products.find().then((product) => {
    res.status(200).json(product);
  });
};
exports.getDetail = (req, res, next) => {
  const id = req.params.id;
  Products.findOne({ _id: id })
    .then((product) => {
      if (!product) {
        res.status(401).json({ message: "not found" });
        return;
      }
      res.status(200).json(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addProduct = (req, res, next) => {
  const name = req.query.name;
  const category = req.query.category;
  const shortDes = req.query.shortDes;
  const longDes = req.query.longDes;
  const image = req.files;


  if (!image || image.length <= 4) {
    res.status(401).json({
      message: "The file format to upload will must be 5 file JPG or PNG or JPEG",
    });
    return;
  }
  const imageUrl = "https://server-asm3.onrender.com/";

  const product = new Products({
    category: category,
    img1: imageUrl + image[0].path,
    img2: imageUrl + image[1].path,
    img3: imageUrl + image[2].path,
    long_desc: longDes,
    name: name,
    short_desc: shortDes,
    price: "500",
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.status(200).json({ message: "SUCCESS" });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.editProduct = (req,res,next)=>{

  const prodId = req.body.id;
  const updatedName = req.body.name;
  const updatedShort= req.body.shortDes;
  const updatedLong = req.body.longDes;
  const updatedCate = req.body.category;

  Products.findById(prodId)
    .then(product => {
      product.name = updatedName;
      product.category = updatedCate;
      product.long_desc = updatedLong;
      product.short_desc = updatedShort;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.status(200).json({ message: "UPDATED PRODUCT!" });
    })
    .catch(err => console.log(err));
};
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.id;
  Products.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({ message: "DESTROYED PRODUCT" });
    })
    .catch(err => console.log(err));
};