// controllers/authController.js - Kullanıcı Giriş/Kayıt İş Mantığı (Auth Controller)
const db = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_botanika_key';

// 📝 Yeni Kullanıcı Kaydı (Register)
exports.register = async (req, res) => {
    const { kullanici_adi, sifre } = req.body;
    
    if (!kullanici_adi || !sifre) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }
    
    try {
        // Şifre güvenliği için salt turu 10 olarak hashlenir
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
};

// 🔑 Kullanıcı Girişi ve Oturum Açma (Login)
exports.login = (req, res) => {
    const { kullanici_adi, sifre } = req.body;
    
    db.get(`SELECT * FROM Users WHERE kullanici_adi = ?`, [kullanici_adi], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        
        // Girilen şifre ile hashlenmiş şifre doğrulanır
        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        
        // Orijinal 24 saatlik JWT token üretimi
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        
        // Frontend'in beklediği token ve kullanici_adi verileri eksiksiz dönülür
        res.json({ token, kullanici_adi: user.kullanici_adi });
    });
};