const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");

router.get("/sign-up", (req, res) => {
    user = req.session.user;
    res.render("auth/sign-up.ejs", { whatPage: "sign-up" });
   
});
router.get("/sign-in", (req, res) => {
    user = req.session.user;
    res.render("auth/sign-in.ejs", { whatPage: "sign-in" });
   
});
router.get("/sign-out", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});
router.post("/sign-up", async (req, res) => {
    try {
        // Check if the username is already taken
        const userInDatabase = await User.findOne({
            username: req.body.username,
        });
        if (userInDatabase) {
            return res.send("Username already taken.");
        }

        // Username is not taken already!
        // Check if the password and confirm password match
        if (req.body.password !== req.body.confirmPassword) {
            return res.send("Password and Confirm Password must match");
        }

        // Must hash the password before sending to the database
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        req.body.password = hashedPassword;

        // All ready to create the new user!
        await User.create(req.body);

        res.redirect("/auth/sign-in");
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});
router.post("/sign-in", async (req, res) => {
    try {
        // First, get the user from the database
        const userInDatabase = await User.findOne({
            username: req.body.username,
        });
        if (!userInDatabase) {
            return res.send("Login failed. Please try again.");
        }

        // There is a user! Time to test their password with bcrypt
        const validPassword = bcrypt.compareSync(
            req.body.password,
            userInDatabase.password
        );
        if (!validPassword) {
            return res.send("Login failed. Please try again.");
        }


        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id,
            tokens: userInDatabase.tokens,
        };

        res.redirect(`/dashboard/${req.session.user._id}`);
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});
module.exports = router;
