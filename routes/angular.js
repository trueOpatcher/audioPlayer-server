const express = require('express');
const pathy = __dirname + '/musicPlayer/views/';
const app = express();
const router = express.Router();
const angularController = require('../controllers/angular');


router.get('*', angularController.getAngular);

module.exports = router;
