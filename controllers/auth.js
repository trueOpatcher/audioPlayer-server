const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../models/user');

const Realm = require('realm-web');
const app = new Realm.App({ id: "musicplayer-gxlig" });

const mongoose = require('mongoose');



// *signUp user in mongodbReaml*
exports.postSignup = (req, res, next) => {
    if (!req.body.email) {
        return res.status(400).send({ message: 'No email in request body' });
    } else if (!req.body.password) {
        return res.status(400).send({ message: 'No password in request body' });
    } else if (!req.body.userName) {
        return res.status(400).send({ message: 'No User Name in request body' });
    }

    const signUpEmail = req.body.email;
    const signUpPassword = req.body.password;
    const signUpUserName = req.body.userName;


    const db = mongoose.connection.db;
    console.log(signUpUserName);
    console.log(signUpPassword);


    db.collection('users').findOne({ userName: signUpUserName }).then(userData => {

        if (userData) {
            return res.status(400).send({ message: 'User Name occupied' });
        }

        const credentials = Realm.Credentials.emailPassword(signUpEmail, signUpPassword);

        req.session.userName = signUpUserName;;
        req.session.email = signUpEmail;
        app.emailPasswordAuth.registerUser(signUpEmail, signUpPassword).then(() => {

            app.logIn(credentials).then(userData => {

                const userID = userData.id;
                const email = userData._profile.data.email;



                user = new User({
                    _id: userID,
                    userName: signUpUserName,
                    email: email
                });

                user.save().then(() => {
                    console.log('track is saved in db');

                }).catch(error => {
                    console.log(error);
                })


                return res.status(200).send(userData);

            }).catch(error => {
                console.log(error);
                // send login error to client
                return res.status(422).send({ message: error });
            });


        }).catch(error => {
            console.log(error);
            // send signup error to client
            return res.status(409).send({ message: error.error });
        });




    }).catch(error => {
        console.log(error);
    })






};

exports.postLogin = (req, res, next) => {

    console.log('login00');
    const db = mongoose.connection.db;
    const ObjectID = mongoose.Types.ObjectId;

    const email = req.body.email;
    const password = req.body.password;
    const credentials = Realm.Credentials.emailPassword(email, password);

    app.logIn(credentials).then(userData => {
        const userID = userData.id;
        db.collection('users').findOne({ _id: new ObjectID(userID) }).then(userDoc => {
            if(!userDoc) {
                return res.status(400).send({message: 'user is not found in db'});
            }
            req.session.userName = userDoc.userName;
            req.session.email = userDoc.email;
            return res.status(200).send(userData);
    
        }).catch(error => {
            console.log(error);
            return res.status(400).send({ message: error });

        }).finally(userData => {
            
        })


        
    }).catch(error => {
        return res.status(422).send({ message: error });
    }).finally();

    


};

exports.getAutoLogin = (req, res, next) => { };

exports.getLogout = (req, res, next) => {
    req.session.destroy(() => {
        console.log('session deleted');

    });
    res.end();
}

exports.isAuth = (req, res, next) => {
    if (req.session.userName) {
        res.status(200).send({ isAuth: true });
    } else {
        res.status(200).send({ isAuth: false });
    }


}