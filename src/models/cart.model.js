const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require("../config/config")

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const cartSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    cartItems: [
      {
        product: { type: productSchema, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    paymentOption: {type: String, default: config.default_payment_option},
  },
  {
    timestamps: false,
  }
);


/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;