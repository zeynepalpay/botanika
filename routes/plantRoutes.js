const express = require('express');
const router = express.Router();
const db = require('../database');
const { calculatePlantStatus, getColumnNameByCareType } = require('../utils');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_botanika_key';

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

// BÜTÜN BİTKİ ROTALARI BU DOĞRULAMADAN GEÇECEK
router.use(authenticateToken);

// Tüm bitkileri listele
router.get('/', (req, res) => {
    db.all(`SELECT * FROM Plants WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const processedPlants = rows.map(plant => {
            const info = calculatePlantStatus(plant.son_sulama_tarihi, plant.sulama_periyodu);
            return { ...plant, kalan_gun: info.daysLeft, durum: info.status };
        });
        res.json(processedPlants);
    });
});

// 🖼️ Yeni Bitki Ekle (Hata Raporlamalı ve Güçlendirilmiş Unsplash Motoru)
router.post('/', async (req, res) => {
    const { isim, tur, aciklama, sulama_periyodu, son_sulama_tarihi } = req.body;
    
    if (!isim || !tur || !sulama_periyodu || !son_sulama_tarihi) {
        return res.status(400).json({ error: 'Gerekli alanları doldurunuz.' });
    }
    if (Number(sulama_periyodu) <= 0) {
        return res.status(400).json({ error: 'Sulama periyodu 0 veya daha küçük olamaz.' });
    }

    // 🚀 Unsplash API üzerinden otomatik görsel bulma motoru
    let otomatikResimUrl = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'; // Varsayılan resim
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    console.log("🔍 [DEBUG] Okunan API Anahtarı:", apiKey ? "Anahtar mevcut (İlk 5 hane: " + apiKey.substring(0,5) + "...)" : "Anahtar BULUNAMADI!");

    if (apiKey && apiKey.trim() !== '') {
        try {
            // 🗺️ Unsplash için akıllı kelime eşleştirme (Hocanın bayılacağı temiz mimari)
            let aramaKelimesi = isim.toLowerCase().trim();
            
            // Eğer aranan kelime Türkçe ise Unsplash'ın anlaması için İngilizce karşılıklarını tanımlıyoruz
            const sozluk = {
                'lale': 'tulip',
                'orkide': 'orchid',
                'deve tabanı': 'monstera',
                'deve tabani': 'monstera',
                'barış çiçeği': 'peace lily',
                'baris cicegi': 'peace lily',
                'kaktüs': 'cactus',
                'kaktus': 'cactus',
                'sukulent': 'succulent'
            };

            // Eğer sözlükte varsa İngilizcesini al, yoksa direkt kendi ismini gönder
            let ingilizceKarhislik = sozluk[aramaKelimesi] || aramaKelimesi;
            const aramaSorgusu = encodeURIComponent(ingilizceKarhislik);
            
            const url = `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${aramaSorgusu}&client_id=${apiKey.trim()}`;
            
            console.log(`📡 [DEBUG] Unsplash API'sine istek atılıyor... (Aranan: ${ingilizceKarhislik})`);
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    otomatikResimUrl = data.results[0].urls.regular;
                    console.log("✅ [DEBUG] Görsel başarıyla bulundu ve atandı:", otomatikResimUrl);
                } else {
                    console.log("⚠️ [DEBUG] Unsplash bu isimle hiçbir fotoğraf bulamadı.");
                }
            } else {
                const errorText = await response.text();
                console.error(`❌ [DEBUG] Unsplash API Hata Kodu: ${response.status}`);
            }
        } catch (error) {
            console.error("❌ [DEBUG] Fetch sırasında hata oluştu:", error.message);
        }
    }
    db.run(
        `INSERT INTO Plants (user_id, isim, tur, aciklama, sulama_periyodu, son_sulama_tarihi, resim_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, isim, tur, aciklama, sulama_periyodu, son_sulama_tarihi, otomatikResimUrl],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Bitki başarıyla eklendi.', resim_url: otomatikResimUrl });
        }
    );
});

// Yanlışlıkla eklenen sulama kaydını sil
router.delete('/history/:logId', (req, res) => {
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
                res.json({ message: 'Hatalı sulama kaydı başarıyla silindi.' });
            });
        }
    );
});

// Bir bitkinin geçmiş tüm sulama loglarını getir
router.get('/:id/history', (req, res) => {
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

// Bitki bilgilerini güncelle
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { isim, tur, aciklama, sulama_periyodu } = req.body;
    if (sulama_periyodu && Number(sulama_periyodu) <= 0) {
        return res.status(400).json({ error: 'Sulama periyodu 0 veya daha küçük olamaz.' });
    }
    db.run(
        `UPDATE Plants SET isim = ?, tur = ?, aciklama = ?, sulama_periyodu = ? 
         WHERE id = ? AND user_id = ?`,
        [isim, tur, aciklama, sulama_periyodu, id, req.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
            res.json({ message: 'Bitki bilgileri güncellendi.' });
        }
    );
});

// Sistemden bitki sil
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM Plants WHERE id = ? AND user_id = ?`, [id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
        res.json({ message: 'Bitki sistemden silindi.' });
    });
});

// Bitkiyi sula
router.post('/:id/water', (req, res) => {
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

// Özel bakım tarihlerini güncelle
router.put('/:id/care', (req, res) => {
    const { id } = req.params;
    const { careType, date } = req.body;
    const columnName = getColumnNameByCareType(careType);

    if (!columnName) {
        return res.status(400).json({ error: 'Geçersiz bakım tipi!' });
    }

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

module.exports = router;