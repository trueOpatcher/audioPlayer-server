const express = require('express');
const path = require('path');
const pathy = path.join(__dirname, '/musicPlayer/views/');
const app = express();
var options = {
    root: path.join(__dirname, '../', 'views', 'client')
};

exports.getAngular = (req, res, next) => {
    console.log(options);
    res.sendFile('/index.html', options);

}