// routes/plantRoutes.js - Bitki Varlığı Yönetimi API Rotaları (CRUD)
const express = require('express');
const router = express.Router();
const db = require('../database');
const { calculatePlantStatus, getColumnNameByCareType } = require('../utils');

// Harici katmandan kimlik doğrulama ara yazılımı (middleware) projeye dahil edilir
const authenticateToken = require('../middlewares/authMiddleware');

// 🔒 Güvenlik Kapısı: Bu rotadaki tüm endpoint'ler öncelikle token doğrulamasından geçmek zorundadır
router.use(authenticateToken);

/**
 * @route   GET /api/plants
 * @desc    Giriş yapan kullanıcının tüm bitkilerini listeler ve kalan gün/durum analizi yapar.
 */
router.get('/', (req, res) => {
    db.all(`SELECT * FROM Plants WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // İş mantığı katmanı (utils) kullanılarak her bitkinin güncel durumu anlık hesaplanır
        const processedPlants = rows.map(plant => {
            const info = calculatePlantStatus(plant.son_sulama_tarihi, plant.sulama_periyodu);
            return { ...plant, kalan_gun: info.daysLeft, durum: info.status };
        });
        res.json(processedPlants);
    });
});

/**
 * @route   POST /api/plants
 * @desc    Yeni bir bitki varlığı oluşturur. Unsplash API entegrasyonu ile otomatik görsel atar.
 */
router.post('/', async (req, res) => {
    const { isim, tur, aciklama, sulama_periyodu, son_sulama_tarihi } = req.body;
    
    // Girdi Doğrulama (Validation) - Alanların boş gelmesi engellenir
    if (!isim || !tur || !sulama_periyodu || !son_sulama_tarihi) {
        return res.status(400).json({ error: 'Gerekli alanları doldurunuz.' });
    }
    // Mantıksal Doğrulama - Sulama periyodu negatif veya sıfır olamaz
    if (Number(sulama_periyodu) <= 0) {
        return res.status(400).json({ error: 'Sulama periyodu 0 veya daha küçük olamaz.' });
    }

    let otomatikResimUrl = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'; // Varsayılan görsel
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    // Harici API Entegrasyonu: Unsplash Motoru
    if (apiKey && apiKey.trim() !== '') {
        try {
            let aramaKelimesi = isim.toLowerCase().trim();
            const sozluk = {
                'lale': 'tulip', 'orkide': 'orchid', 'deve tabanı': 'monstera',
                'deve tabani': 'monstera', 'barış çiçeği': 'peace lily',
                'baris cicegi': 'peace lily', 'kaktüs': 'cactus',
                'kaktus': 'cactus', 'sukulent': 'succulent'
            };

            let ingilizceKarsilik = sozluk[aramaKelimesi] || aramaKelimesi;
            const aramaSorgusu = encodeURIComponent(ingilizceKarsilik);
            const url = `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${aramaSorgusu}&client_id=${apiKey.trim()}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    otomatikResimUrl = data.results[0].urls.regular;
                }
            }
        } catch (error) {
            console.error("❌ Unsplash bağlantı hatası:", error.message);
        }
    }

    // Doğrulanan güvenli veri veritabanına kaydedilir
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

/**
 * @route   DELETE /api/plants/history/:logId
 * @desc    Kullanıcının yanlışlıkla eklediği bir geçmiş sulama kaydını (Watering Log) siler.
 */
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

/**
 * @route   GET /api/plants/:id/history
 * @desc    Belirli bir bitkinin geçmişe dönük tüm sulama kayıtlarını listeler.
 */
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

/**
 * @route   PUT /api/plants/:id
 * @desc    Mevcut bir bitkinin temel künye bilgilerini (isim, periyot vb.) günceller.
 */
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

/**
 * @route   DELETE /api/plants/:id
 * @desc    Bir bitki varlığını veritabanından tamamen siler.
 */
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM Plants WHERE id = ? AND user_id = ?`, [id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
        res.json({ message: 'Bitki sistemden silindi.' });
    });
});

/**
 * @route   POST /api/plants/:id/water
 * @desc    Bitkiyi sular, son sulama tarihini bugüne günceller ve geçmiş log tablosuna ekler.
 */
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

/**
 * @route   PUT /api/plants/:id/care
 * @desc    Gelen bakım türüne (toprak, ilaç, aşı) göre dinamik sütun tespiti yapar ve tarihi günceller.
 */
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