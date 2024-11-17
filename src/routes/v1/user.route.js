const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");

// const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get("/:userId", auth, validate(userValidation.getUser),userController.getUser);
router.get("/:userId?q=address", auth, validate(userValidation.setAddress),userController.setAddress);
router.put("/:userId", 
    auth,
    validate(userValidation.setAddress),
    userController.setAddress,
);
module.exports = router;
