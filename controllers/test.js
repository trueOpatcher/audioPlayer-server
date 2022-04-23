const express = require('express');
const path = require('path');
const router = express.Router();


    exports.postTest = (req, res, next) => {
        
    };



exports.getTest = (req, res, next) => {
    console.log('I\'m here');
    
    res.sendFile(path.join(__dirname, '../', 'views', 'test.html'));
   
};
