// server.js - Botanika API 
require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./database');

// Modüler Mimariden Çağrılan Yeni Yapılar 🚀
const { swaggerUi, swaggerDocs } = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 📄 Swagger API Dokümantasyonu Kapısı
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 🌐 Modüler Rotaların Dağıtımı
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);

// 🗄️ Veritabanı İlişkisel Tablo Kontrolü
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

// 🚀 Sunucu Başlatma
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Botanika Sunucusu kusursuz sekilde calisiyor!`);
    console.log(`🌐 API Adresi: http://localhost:${PORT}`);
    console.log(`📄 Swagger Dokümantasyonu: http://localhost:${PORT}/api-docs`);
    console.log(`==================================================`);
});