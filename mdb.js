const http = require("http");
const express = require("express"); // express
const session = require("express-session");
const bodyParser = require("body-parser"); // used by express, middleware
const bcrypt = require("bcrypt");
const mongodb = require("mongodb").MongoClient;
const MongoStore = require("connect-mongo")(session);

const db = require("./public/js/db");

// create express application
const app = express();
// the port the server will be listening to
const port = 5000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// start using ejs template engine
app.set("view engine", "ejs");

// use resources in the public folder
app.use(express.static(__dirname + "/public"));

// session init
app.use(session({
    name: "cookie", // cookie name
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: "secret", // secret string used to encrypt the cookie (should be way more complicated)
    cookie: {
        secure: false, // true for https (default), or false for http
        maxAge: 1000 * 60 * 10, // cookie age in milliseconds, set for 10 mins
        sameSite: true
    },
    store: new MongoStore({url: `mongodb://${db.userPw}@${db.url}/${db.DB}`})
}));

app.get("/", (request, response) => {
    if (request.session.name) {
        db.loggedIn(request, response);
    } else {
        response.render("pages/index");
    }
});

app.post("/login", (request, response) => {
    db.login(request, response);
});

app.post("/register", (request, response) => {
    db.register(request, response);
});

app.post("/update", (request, response) => {
    db.update(request, response);
});

app.get("/logout", (request, response) => {
    db.logout(request, response);
});

// create server that is listening to a set port (above)
http.createServer(app).listen(port, () => {
    console.log(`Listening to port ${port}.`);
});