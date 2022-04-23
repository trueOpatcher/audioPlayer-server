const express = require('express');

const router = express.Router();


const authController = require('../controllers/auth');


router.post('/signup', authController.postSignup);

router.post('/login', authController.postLogin);
router.get('/autoLogin', authController.getAutoLogin);

router.get('/logout', authController.getLogout);
router.get('/isAuth', authController.isAuth);


module.exports = router;