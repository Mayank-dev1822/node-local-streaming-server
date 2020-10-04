//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const testFolder = 'public/vids/';
const fs = require('fs');
var list = "";
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { config } = require('process');


// NODE APP CONFIGS
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


// PASSPORT INITIALIZATION

app.use(session({
    secret: "My Key",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// MONGODB CONNECTION
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//PASSPORT COOKIES
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ROOTS FOR THE SERVER
app.get("/register", function (req, res) {      //register get
    res.render("register");
});

app.post("/register", function (req, res) {     //register post

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    });

});

app.get("/", function (req, res) {      //login get
    res.render("login");
});

app.post("/", function (req, res) {     //login post

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.logIn(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    });
});


app.get("/home", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("home");
    } else {
        res.redirect("/");
    }
});

app.get("/music", function (req, res) {
    res.render("music");
});

app.get("/videos", function (req, res) {
    if (req.isAuthenticated()) {
        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                list = file;
                // console.log(list);
            });
        });
        res.render("videos", { listing: list });
    } else {
        res.redirect("/");
    }
});

app.get("/documents", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("docs");
    } else {
        res.redirect("/");
    }
});

app.get("/photos", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("photos");
    } else {
        res.redirect("/");
    }
});

app.get("/player", function (req, res) {
    res.render("player")
});


app.listen(3000, '0.0.0.0', function () {
    console.log("server started at port 3000");
});