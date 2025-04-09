const express = require('express');
const router = express.Router();
const { signup, login, logout, refreshAccessToken, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getProfile);
router.get('/refresh', refreshAccessToken);

module.exports = router;
