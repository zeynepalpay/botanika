// models/database.js - Veritabanı Erişim Katmanı (Model)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Projenin ana dizinindeki orijinal 'botanika.db' dosyasının yolu
const dbPath = path.resolve(__dirname, '../botanika.db');

// Veritabanı bağlantısı açılır
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Veritabanı açılırken hata oluştu:', err.message);
    } else {
        console.log('💾 SQLite Veritabanı başarıyla bağlandı (MVC - Model Katmanı).');
    }
});

// Tabloları sırasıyla ve kurallara uygun olarak oluşturuyoruz
db.serialize(() => {
    // SQLite üzerinde Foreign Key kısıtlamalarını aktif eder
    db.run("PRAGMA foreign_keys = ON");

    // Kullanıcılar Tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kullanici_adi TEXT NOT NULL UNIQUE,
            sifre TEXT NOT NULL
        )
    `);

    // Bitkiler Tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS Plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            isim TEXT NOT NULL,
            tur TEXT NOT NULL,
            aciklama TEXT,
            toprak_bakimi TEXT,
            ilaclama_notu TEXT,
            asilama_durumu TEXT,
            sulama_periyodu INTEGER NOT NULL,
            son_sulama_tarihi TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
        )
    `);

    // Sulama Geçmişi Tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS WateringLogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bitki_id INTEGER NOT NULL,
            sulama_tarihi TEXT NOT NULL,
            FOREIGN KEY (bitki_id) REFERENCES Plants (id) ON DELETE CASCADE
        )
    `);
});

// Geriye dönük uyumluluk için resim_url kolonu kontrolü
db.serialize(() => {
    db.run(`ALTER TABLE Plants ADD COLUMN resim_url TEXT`, (err) => {
        if (err) {
            if (!err.message.includes("duplicate column name")) {
                console.log("ℹ️ Görsel kolonu kontrolü:", err.message);
            }
        } else {
            console.log("🌿 Veritabanına otomatik 'resim_url' kolonu başarıyla eklendi!");
        }
    });
});

// 🚨 EN KRİTİK NOKTA: db nesnesini dışarı aktarıyoruz
module.exports = db;