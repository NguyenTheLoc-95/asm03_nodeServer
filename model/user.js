const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//----------------
const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Products',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});
userSchema.methods.addToCart = function(product,count) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {

    updatedCartItems[cartProductIndex].quantity = count;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: count
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
