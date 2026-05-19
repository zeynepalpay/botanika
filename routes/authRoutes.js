const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_botanika_key';

router.post('/register', async (req, res) => {
    const { kullanici_adi, sifre } = req.body;
    if (!kullanici_adi || !sifre) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(sifre, 10);
        db.run(
            `INSERT INTO Users (kullanici_adi, sifre) VALUES (?, ?)`,
            [kullanici_adi, hashedPassword],
            function(err) {
                if (err) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
                res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
            }
        );
    } catch (e) {
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
});

router.post('/login', (req, res) => {
    const { kullanici_adi, sifre } = req.body;
    db.get(`SELECT * FROM Users WHERE kullanici_adi = ?`, [kullanici_adi], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, kullanici_adi: user.kullanici_adi });
    });
});

module.exports = router;