// controllers/plantController.js - Bitki İş Mantığı ve Request/Response Yönetimi
const db = require('../models/database');
const { calculatePlantStatus, getColumnNameByCareType } = require('../utils'); 

// Tüm bitkileri listeleme fonksiyonu
exports.getAllPlants = (req, res) => {
    db.all(`SELECT * FROM Plants WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const processedPlants = rows.map(plant => {
            const info = calculatePlantStatus(plant.son_sulama_tarihi, plant.sulama_periyodu);
            return { ...plant, kalan_gun: info.daysLeft, durum: info.status };
        });
        res.json(processedPlants);
    });
};

// Yeni bitki ekleme fonksiyonu (Unsplash Motoru Dahil)
exports.createPlant = async (req, res) => {
    const { isim, tur, aciklama, sulama_periyodu, son_sulama_tarihi } = req.body;
    
    if (!isim || !tur || !sulama_periyodu || !son_sulama_tarihi) {
        return res.status(400).json({ error: 'Gerekli alanları doldurunuz.' });
    }
    if (Number(sulama_periyodu) <= 0) {
        return res.status(400).json({ error: 'Sulama periyodu 0 veya daha küçük olamaz.' });
    }

    // 📅 Tarih Doğrulama Katmanı (Gelecek tarihleri ve hane taşmalarını engeller)
    const girilenTarih = new Date(son_sulama_tarihi);
    const bugun = new Date();
    const yil = girilenTarih.getFullYear();

    // 1. Temel hane ve format kontrolü (Örn: 2027737777 gibi taşmaları önler)
    if (isNaN(yil) || yil < 1000 || yil > 9999 || son_sulama_tarihi.split('-')[0].length !== 4) {
        return res.status(400).json({ error: 'Geçersiz tarih formatı! Yıl 4 haneli olmalıdır.' });
    }

    // 2. Gelecek tarih kontrolü (Girilen tarih bugünden büyük olamaz)
    const bugunISO = bugun.toISOString().split('T')[0];
    if (son_sulama_tarihi > bugunISO) {
        return res.status(400).json({ error: 'Son sulama tarihi gelecekte bir gün olamaz!' });
    }

    let otomatikResimUrl = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500';
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    if (apiKey && apiKey.trim() !== '') {
        try {
            let aramaKelimesi = isim.toLowerCase().trim();
            const sozluk = {
            // Orijinal Bitkiler
                'lale': 'tulip',
                'orkide': 'orchid',
                'deve tabanı': 'monstera',
                'deve tabani': 'monstera',
                'barış çiçeği': 'peace lily',
                'baris cicegi': 'peace lily',
                'kaktüs': 'cactus',
                'kaktus': 'cactus',
                'sukulent': 'succulent',
                'menekşe': 'violet',
                'menekse': 'violet',

                // Yeni Eklenen Popüler Çiçekler ve Ev Bitkileri 🚀
                'gül': 'rose',
                'gul': 'rose',
                'papatya': 'daisy',
                'karanfil': 'carnation',
                'ayçiçeği': 'sunflower',
                'aycicegi': 'sunflower',
                'lavanta': 'lavender',
                'zambak': 'lily',
                'yasemin': 'jasmine',
                
                // Popüler Ev/Balkon Bitkileri
                'aloe vera': 'aloe vera',
                'fesleğen': 'basil',
                'feslegen': 'basil',
                'nane': 'mint',
                'biberiye': 'rosemary',
                'paşa kılıcı': 'snake plant',
                'pasa kilici': 'snake plant',
                'kurdele çiçeği': 'spider plant',
                'kurdele cicegi': 'spider plant',
                'para ağacı': 'jade plant',
                'para agaci': 'jade plant',
                'sarmaşık': 'ivy',
                'sarmasik': 'ivy'
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
            console.error("❌ Unsplash motoru hatası:", error.message);
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
};

// Yanlışlıkla eklenen sulama kaydını silme fonksiyonu
exports.deleteHistoryLog = (req, res) => {
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
};

// Geçmiş tüm sulama loglarını getirme fonksiyonu
exports.getPlantHistory = (req, res) => {
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
};

// Bitki bilgilerini güncelleme fonksiyonu
exports.updatePlant = (req, res) => {
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
};

// Sistemden bitki silme fonksiyonu
exports.deletePlant = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM Plants WHERE id = ? AND user_id = ?`, [id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Bitki bulunamadı veya yetkiniz yok.' });
        res.json({ message: 'Bitki sistemden silindi.' });
    });
};

// Bitkiyi sulama fonksiyonu
exports.waterPlant = (req, res) => {
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
};

// Özel bakım tarihlerini güncelleme fonksiyonu
exports.updatePlantCare = (req, res) => {
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
};