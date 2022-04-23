const express = require('express');

const authCheck = require('../middleware/route-protection');

const router = express.Router();

const mp3_Controller = require('../controllers/mp3');

router.get('/download/image', mp3_Controller.download_img);

router.get('/download/mp3', authCheck, mp3_Controller.download_mp3);

router.post('/upload/mp3', authCheck, mp3_Controller.upload_mp3);

router.delete('/delete/mp3', authCheck, mp3_Controller.delete_mp3);

module.exports = router;