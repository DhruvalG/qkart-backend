const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  try {
    let cart = await Cart.findOne({ email: user.email });
    if(!cart){
      throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
    }
    return cart;
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || httpStatus[500]
    );
  }
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  try {
    let cart = await Cart.findOne({ email: user.email });
    if(!cart){
      cart = await Cart.create({ email: user.email, cartItems: [] });
    }
    let productsExistsInCart = cart.cartItems.some(
      (item) => item.product._id.toString() === productId
    );
    if(productsExistsInCart){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product was already in cart. Use the cart sidebar to update or remove product from cart"
      );
    }
    let product = await Product.findById(productId);
    if(!product){
      throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
    }
    cart.cartItems.push({ product, quantity });
    await cart.save();
    return cart;
  } catch (error){
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || httpStatus[500]
    );
  }
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  try{
    let cart = await Cart.findOne({ email: user.email });
    if(!cart){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User does not have a cart. Use POST to create cart and add a product"
      );
    }
    let product = await Product.findById(productId);
    if(!product){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product doesn't exisst in database"
      );
    }
    let productIndex = cart.cartItems.findIndex(
      (item) => item.product._id.toString() === productId
    );
    if(productIndex == -1)
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
    cart.cartItems[productIndex].quantity = quantity;
    await cart.save();
    return cart;
  } catch (error){
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || httpStatus[500]
    );
  }
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  try{
    let cart = await Cart.findOne({ email: user.email });
    if(!cart)
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
    let productIndex = cart.cartItems.findIndex(
      (item) => item.product._id.toString() === productId
    );
    if(productIndex == -1)
      throw new ApiError(httpStatus.BAD_REQUEST, "product not in cart");
    cart.cartItems.splice(productIndex, 1);
    await cart.save();
  } catch (error){
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || httpStatus[500]
    );
  }
};

let checkout = async (user) => {
  try {
    let cart = await Cart.findOne({ email: user.email });
    if(!cart){
      throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
    }
    if(cart.cartItems.length == 0){
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
    }
    if(!await user.hasSetNonDefaultAddress()){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User does not have an address"
      );
    }
    let totalPrice = cart.cartItems.reduce(
      (acc, curr) => curr.product.cost * curr.quantity + acc,
      0
    );
    if(totalPrice > user.walletMoney){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User wallet balance is insufficient"
      );
    }
    user.walletMoney -= totalPrice;
    await user.save();
    cart.cartItems = [];
    await cart.save();
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || httpStatus[500]
    );
  }
};


module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
