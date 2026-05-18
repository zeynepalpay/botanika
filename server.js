// server.js - Botanika API 
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require('./database');
const { calculatePlantStatus } = require('./utils');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_botanika_key';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------------------
// Swagger Dokümantasyonu Ayarları
// -------------------------------------------------------------------------
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Botanika - Akıllı Bitki Bakımı API',
            version: '1.0.0',
            description: 'Ev bitkilerinin envanterini tutan ve sulama durumlarını hesaplayan RESTful API sistemi.',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        paths: {
            '/api/auth/register': {
                post: {
                    summary: 'Yeni kullanıcı kaydı oluşturur',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        kullanici_adi: { type: 'string' },
                                        sifre: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Kullanıcı başarıyla oluşturuldu' },
                        400: { description: 'Kullanıcı adı ve şifre zorunludur veya alınmıştır' }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    summary: 'Kullanıcı girişi yapar ve JWT Token döner',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        kullanici_adi: { type: 'string' },
                                        sifre: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Giriş başarılı, token döndürüldü' },
                        401: { description: 'Kullanıcı adı veya şifre hatalı' }
                    }
                }
            },
            '/api/plants': {
                get: {
                    summary: 'Giriş yapan kullanıcının tüm bitkilerini listeler',
                    responses: {
                        200: { description: 'Bitki listesi başarıyla getirildi' }
                    }
                },
                post: {
                    summary: 'Giriş yapan kullanıcıya yeni bir bitki ekler',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        isim: { type: 'string' },
                                        tur: { type: 'string' },
                                        aciklama: { type: 'string' },
                                        toprak_bakimi: { type: 'string' },
                                        ilaclama_notu: { type: 'string' },
                                        asilama_durumu: { type: 'string' },
                                        sulama_periyodu: { type: 'integer' },
                                        son_sulama_tarihi: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Bitki başarıyla eklendi' },
                        400: { description: 'Eksik veri veya geçersiz periyot' }
                    }
                }
            },
            '/api/plants/{id}': {
                put: {
                    summary: 'Bitki bilgilerini günceller',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Bitki başarıyla güncellendi' }
                    }
                },
                delete: {
                    summary: 'Sistemden bitki siler',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Bitki başarıyla silindi' }
                    }
                }
            },
            '/api/plants/{id}/water': {
                post: {
                    summary: 'Bitkiyi sular ve geçmişe kaydeder',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Bitki başarıyla sulandı' }
                    }
                }
            },
            '/api/plants/history/{logId}': {
                delete: {
                    summary: 'Yanlışlıkla eklenen sulama kaydını siler',
                    parameters: [{ in: 'path', name: 'logId', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Kayıt başarıyla silindi' },
                        404: { description: 'Kayıt bulunamadı' }
                    }
                }
            }
        }
    },
    apis: [],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 🔐 Güvenlik Duvarı (Middleware)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Erişim engellendi. Giriş yapmalısınız.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Geçersiz token.' });
        req.userId = decoded.userId;
        next();
    });
}

// -------------------------------------------------------------------------
// ROUTE'LAR
// -------------------------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', (req, res) => {
    const { kullanici_adi, sifre } = req.body;
    db.get(`SELECT * FROM Users WHERE kullanici_adi = ?`, [kullanici_adi], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, kullanici_adi: user.kullanici_adi });
    });
});

app.get('/api/plants', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM Plants WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const processedPlants = rows.map(plant => {
            const info = calculatePlantStatus(plant.son_sulama_tarihi, plant.sulama_periyodu);
            return { ...plant, kalan_gun: info.daysLeft, durum: info.status };
        });
        res.json(processedPlants);
    });
});

// ÖNEMLİ: /history route'u /:id route'larından ÖNCE tanımlanmalı
app.delete('/api/plants/history/:logId', authenticateToken, (req, res) => {
    const { logId } = req.params;
    db.get(
        `SELECT wl.id FROM WateringLogs wl 
         JOIN Plants p ON wl.bitki_id = p.id 
         WHERE wl.id = ? AND p.user_id = ?`,
        [logId, req.userId],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: 'Kayıt bulunamadı veya yetkiniz yok.' });
            db.run(`DELETE FROM WateringLogs WHERE id = ?`, [logId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Silinecek kayıt bulunamadı.' });
                res.json({ message: 'Hatalı sulama kaydı başarıyla silindi.' });
            });
        }
    );
});

app.get('/api/plants/:id/history', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT id FROM Plants WHERE id = ? AND user_id = ?`, [id, req.userId], (err, plant) => {
        if (err || !plant) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
        db.all(
            `SELECT wl.id, wl.sulama_tarihi FROM WateringLogs wl WHERE wl.bitki_id = ? ORDER BY wl.id DESC`,
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows || []);
            }
        );
    });
});

app.post('/api/plants', authenticateToken, (req, res) => {
    const { isim, tur, aciklama, toprak_bakimi, ilaclama_notu, asilama_durumu, sulama_periyodu, son_sulama_tarihi } = req.body;
    if (!isim || !tur || !sulama_periyodu || !son_sulama_tarihi) {
        return res.status(400).json({ error: 'Gerekli alanları doldurunuz.' });
    }
    if (Number(sulama_periyodu) <= 0) {
        return res.status(400).json({ error: 'Sulama periyodu 0 veya daha küçük olamaz.' });
    }
    db.run(
        `INSERT INTO Plants (user_id, isim, tur, aciklama, toprak_bakimi, ilaclama_notu, asilama_durumu, sulama_periyodu, son_sulama_tarihi) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, isim, tur, aciklama, toprak_bakimi, ilaclama_notu, asilama_durumu, sulama_periyodu, son_sulama_tarihi],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Bitki başarıyla eklendi.' });
        }
    );
});

app.put('/api/plants/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { isim, tur, aciklama, toprak_bakimi, ilaclama_notu, asilama_durumu, sulama_periyodu } = req.body;
    if (sulama_periyodu && Number(sulama_periyodu) <= 0) {
        return res.status(400).json({ error: 'Sulama periyodu 0 veya daha küçük olamaz.' });
    }
    db.run(
        `UPDATE Plants SET isim = ?, tur = ?, aciklama = ?, toprak_bakimi = ?, ilaclama_notu = ?, asilama_durumu = ?, sulama_periyodu = ? 
         WHERE id = ? AND user_id = ?`,
        [isim, tur, aciklama, toprak_bakimi, ilaclama_notu, asilama_durumu, sulama_periyodu, id, req.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
            res.json({ message: 'Bitki bilgileri güncellendi.' });
        }
    );
});

app.delete('/api/plants/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM Plants WHERE id = ? AND user_id = ?`, [id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
        res.json({ message: 'Bitki sistemden silindi.' });
    });
});

app.post('/api/plants/:id/water', authenticateToken, (req, res) => {
    const { id } = req.params;
    const bugunISO = new Date().toISOString().split('T')[0];
    db.get(`SELECT id FROM Plants WHERE id = ? AND user_id = ?`, [id, req.userId], (err, plant) => {
        if (err || !plant) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
        db.run(`UPDATE Plants SET son_sulama_tarihi = ? WHERE id = ?`, [bugunISO, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run(`INSERT INTO WateringLogs (bitki_id, sulama_tarihi) VALUES (?, ?)`, [id, bugunISO], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Bitki başarıyla sulandı ve geçmişe kaydedildi.', son_sulama_tarihi: bugunISO });
            });
        });
    });
});

//  BAKIM GÜNCELLEME KAPISI
app.put('/api/plants/:id/care', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { careType, date } = req.body;

    let columnName = '';
    if (careType === 'toprak') columnName = 'toprak_bakimi';
    else if (careType === 'ilac') columnName = 'ilaclama_notu';
    else if (careType === 'asi') columnName = 'asilama_durumu';

    if (!columnName) {
        return res.status(400).json({ error: 'Geçersiz bakım tipi!' });
    }

    // Güvenlik: Bitkinin gerçekten bu kullanıcıya ait olup olmadığını kontrol ederek güncelliyoruz
    db.run(
        `UPDATE Plants SET ${columnName} = ? WHERE id = ? AND user_id = ?`,
        [date, id, req.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
            res.json({ message: 'Bakım tarihi başarıyla güncellendi!' });
        }
    );
});

// GEÇMİŞ TABLOSUNUN VARLIĞINI GARANTİ ALTINA ALMA
db.run(`CREATE TABLE IF NOT EXISTS WateringLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bitki_id INTEGER,
    sulama_tarihi TEXT,
    FOREIGN KEY(bitki_id) REFERENCES Plants(id) ON DELETE CASCADE
)`, (err) => {
    if (err) {
        console.error("❌ WateringLogs tablosu oluşturulurken hata:", err.message);
    } else {
        console.log("🗄️ WateringLogs tablosu hazır ve kontrol edildi.");
    }
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Botanika Sunucusu kusursuz sekilde calisiyor!`);
    console.log(`🌐 API Adresi: http://localhost:${PORT}`);
    console.log(`📄 Swagger Dokümantasyonu: http://localhost:${PORT}/api-docs`);
    console.log(`==================================================`);
});