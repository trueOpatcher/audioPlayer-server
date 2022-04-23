const Mp3 = require('../models/mp3');
const mongoose = require('mongoose');

exports.getSharedPlaylist = (req, res, next) => {
    
    Mp3.find().then(trackData => {
       return res.status(200).send(trackData);
    }).catch(error => {
       return res.status(400).send({ message: error });
    })
}

exports.getUserPlaylist = (req, res, next) => {
    if(!req.session.userName) {
        return res.status(400).send({message: 'User is not authenticated'});
    }
    const userName = req.session.userName;

    Mp3.find({ userName: userName }).then(trackData => {
        return res.status(200).send(trackData);
     }).catch(error => {
        return res.status(400).send({ message: error });
     })
}