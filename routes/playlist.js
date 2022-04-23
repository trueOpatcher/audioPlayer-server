const express = require('express');
const router = express.Router();

const authCheck = require('../middleware/route-protection');

const playlistController = require('../controllers/playlist');



router.get('/playlist', authCheck, playlistController.getSharedPlaylist);
router.get('/userPlaylist', authCheck, playlistController.getUserPlaylist);

module.exports = router;