// routes/authRoutes.js - Kullanıcı Kimlik Doğrulama Endpoint Tanımlamaları (Auth Routes)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// HTTP POST istekleri doğrudan controller katmanındaki iş mantığı fonksiyonlarına bağlanır
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;