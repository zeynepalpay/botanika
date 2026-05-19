const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyasının yerini belirliyoruz
const dbPath = path.resolve(__dirname, 'botanika.db');

// Veritabanı bağlantısını açıyoruz
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı açılırken hata oluştu:', err.message);
    } else {
        console.log('SQLite Veritabanı başarıyla bağlandı.');
    }
});

// Tabloları sırasıyla ve güvenli kurallarla oluşturuyoruz
db.serialize(() => {
    // SQLite'ta ilişkilerin (Foreign Key) çalışması için bu şart
    db.run("PRAGMA foreign_keys = ON");

    // Kullanıcılar Tablosu(Şifre şifrelenmiş/hashlenmiş olarak tutulacak)
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
            son_sulama_tarihi TEXT NOT NULL,  --  ISO formatında (YYYY-MM-DD) tutacağız
            FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
        )
    `);

    //  Sulama Geçmişi Tablosu 
    db.run(`
        CREATE TABLE IF NOT EXISTS WateringLogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bitki_id INTEGER NOT NULL,
            sulama_tarihi TEXT NOT NULL,      -- ISO formatında tutulacak
            FOREIGN KEY (bitki_id) REFERENCES Plants (id) ON DELETE CASCADE
        )
    `);
});

// Plants tablosuna resim_url kolonu yoksa otomatik ekler
db.serialize(() => {
    db.run(`ALTER TABLE Plants ADD COLUMN resim_url TEXT`, (err) => {
        if (err) {
            // Eğer kolon zaten varsa hata verecektir, sessizce geçebiliriz
            if (!err.message.includes("duplicate column name")) {
                console.log("Görsel kolonu kontrolü:", err.message);
            }
        } else {
            console.log("🌿 Veritabanına otomatik resim_url kolonu başarıyla eklendi!");
        }
    });
});

module.exports = db;