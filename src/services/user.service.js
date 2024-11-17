const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const { use } = require("../app");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

 getUserById = async (id) => {
    // const user = await User.findById(id);
    // if(!user){
    //   throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
    // }
    // return user;
    try{
      let user = await User.findOne({ _id: id });
      return user;
    } catch (error) {
      throw new Error(`Error retrieving user: ${error.message}`);
    }
  };

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */
 let getUserByEmail = async (email) => {
    try{
      const user = await User.findOne({email});
      return user;
    } catch (error){
      return error;
    }
  };
  const getUserAddressById = async (id) => {
    try{
      return User.findOne({ _id: id }, { email: 1, address: 1 });
    } catch (error) {
      throw new Error(`Error retrieving user: ${error.message}`);
    }
  };
  const setAddress = async (user, newAddress) => {
    user.address = newAddress;
    await user.save();
    return user.address;
  };

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */

 let createUser = async (user) => {
    // const isEmailExist = await User.isEmailTaken(user.email);
    // if(isEmailExist){
    //   throw new ApiError(httpStatus.OK, "Email is already taken");
    // }
    // const newUser = await User.create(user);
    // return newUser
    let ubody = await User.isEmailTaken(user.email);
    if(ubody){
      throw new ApiError(httpStatus.OK, "Email already taken");
    }
    let password = await bcrypt.hash(user.password, 8);
    try {
      let test = await User.create({ ...user, password });
      return test;
    } catch (error) {
      throw new Error(`Error retrieving user: ${error.message}`);
    }
  };

module.exports = {
  getUserByEmail,
  getUserById,
  getUserAddressById,
  setAddress,
  createUser
}
