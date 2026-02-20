const express = require("express");
// const { route } = require("./review");
// const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const router = express.Router();
const userController = require("../controllers/users.js");

//signup
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

//login
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.login);

//logout
router.get("/logout", userController.logout);

module.exports = router;