const bcrypt = require("bcrypt");
const mongodb = require("mongodb").MongoClient;

//bcrypt stuff
salt = 12; // salt rounds

// mongodb stuff
/*
    assumes there is a...
    - mongodb installed and running
    - database called users
    - collection called user
    - fields in the collection called...
        * name
        * password
        * email
    - user with credentials to read and write
      into the database
*/
const url = "localhost:27017";
const DB = "users";
const user = "";
const pw = "";
const userPw = `${user}:${pw}`;

const loggedIn = (request, response) => {
    mongodb.connect(`mongodb://${userPw}@${url}/${DB}`, {useNewUrlParser: true}, (error, db) => {
            if (error) {
                throw error;
            }

            db.db(DB).collection("user").findOne({name: request.session.name}, (err, result) => {
                if (err) {
                    throw err;
                }

                if (result) {
                    response.render("pages/user", {name: request.session.name, email: result.email});
                } else {
                    response.render("pages/user", {name: request.session.name, email: ""});
                }
            });
        });
}

const login = (request, response) => {
    const {name, password} = request.body;
    mongodb.connect(`mongodb://${userPw}@${url}/${DB}`, {useNewUrlParser: true}, (error, db) => {
        if (error) {
            throw error;
        }

        let logged = {title: "", body: "", login: false};
    
        db.db(DB).collection("user").findOne({name: name}, (err, result) => {
            if (err) {
                throw err;
            }

           if (result) {
                bcrypt.compare(password, result.password)
                .then(res => {
                    if (res) {
                        logged.title = "Login successful";
                        logged.body = "You have been logged in. Please wait.";

                        request.session.name = name;
                        logged.login = true;

                        response.send(logged);
                    } else {
                        logged.title = "Login failed.";
                        logged.body = "Please check your credentials.";
                        logged.login = false;

                        response.send(logged);
                    }
                })
           } else {
                logged.title = "Login failed.";
                logged.body = "No such user."
                logged.login = false;

                response.send(logged);
           }
        });
    });
}

const logout = (request, response) => {
    request.session.destroy(err => {
        if (err) {
            response.redirect("/");
        } else {
            request.session = null;
            response.clearCookie('connect.sid', {
                path: "/",
                secure: false,
                httpOnly: true
            })
            .send({result: false, name: ""});
        }
    });
}

const register = (request, response) => {
    const {name, password, email} = request.body;
    mongodb.connect(`mongodb://${userPw}@${url}/${DB}`, {useNewUrlParser: true}, (error, db) => {
        if (error) {
            throw error;
        }

        let reg = {title: "", body: "", registered: false};
    
        db.db(DB).collection("user").findOne({name: name}, (err, result) => {
            if (result) {
                reg.title = "Already registered",
                reg.body = "The user name has already been registered. Please choose another."
                response.send(reg);
            } else {
                bcrypt.hash(password, salt)
                .then(function(hash) {
                    try {
                        db.db(DB).collection("user").insertOne({name: name, password: hash, email: email}, (err, result) => {
                            if (result) {
                                reg.title = "Registration successful";
                                reg.body = "Registration was successful. You can now login with your credentials.";
                                reg.registered = true;

                                response.send(reg);
                            } else {
                                reg.title = "Registration failed";
                                reg.body = "Registration failed. Please try again.";
                                reg.registered = false;

                                response.send(reg);
                            }
                        })
                    } catch(e) {
                        console.log("insert: ", e)
                    }
                });
            }
        });
    });
}

const update = (request, response) => {
    let {name, password, email} = request.body;

    mongodb.connect(`mongodb://${userPw}@${url}/${DB}`, {useNewUrlParser: true}, (error, db) => {
        if (error) {
            throw error;
        }

        let update = {title: "", body: "", update: false};

        db.db(DB).collection("user").findOne({name: name}, (err, result) => {
            if (result) {
                bcrypt.compare(password, result.password)
                .then(res => {
                    if (res) {
                        bcrypt.hash(password, salt)
                        .then(function(hash) {
                            try {
                                db.db(DB).collection("user").findOneAndUpdate({name: name}, {$set: {name: name, password: hash, email: email}}, (err, result2) => {
                                    if (result2) {
                                        update.title = "Update successful";
                                        update.body = "Update was successful.";
                                        update.update = true;

                                        response.send(update);
                                    } else {
                                        update.title = "Update failed";
                                        update.body = "Update failed. Please try again.";
                                        update.update = false;

                                        response.send(update);
                                    }
                                })
                            } catch(e) {
                                console.log("insert: ", e)
                            }
                        });
                    } else {
                        update.title = "Update error";
                        update.body = "Update could not be completed due to wrong password.";
                        update.update = false;

                        response.send(update);
                    }
                })
                
            }
        });
    });
}

// all the variables and functions needed exported
module.exports = {url, DB, user, pw, userPw, loggedIn, login, register, update, logout};