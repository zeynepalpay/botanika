// server.js - Botanika API Ana Giriş Noktası (Application Entry Point)
const pathForDotenv = require('path');
require('dotenv').config({ path: pathForDotenv.join(__dirname, '.env') });
const express = require('express');
const path = require('path');

// 🗄️ Veritabanı Erişim Katmanı (Model) Yeni Klasör Yoluna Göre Çağrılır
const db = require('./models/database');

// 🛠️ Yapılandırma ve Modüler Rota Katmanları (MVC)
const { swaggerUi, swaggerDocs } = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');

const app = express();
const PORT = 3000;

// Global Ara Yazılımlar (Middleware)
app.use(express.json()); // Gelen JSON istek gövdelerini (req.body) parse eder
app.use(express.static(path.join(__dirname, 'public'))); // Frontend statik dosyalarını servis eder

// 📄 Swagger API Dokümantasyonu Endpoint Yönetimi
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 🌐 MVC Modüler Rota Dağıtımı (Routing Layer)
app.use('/api/auth', authRoutes);   // Kullanıcı kayıt ve giriş işlemleri
app.use('/api/plants', plantRoutes); // Bitki CRUD ve bakım işlemleri



// 🚀 HTTP Sunucusunun Başlatılması
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Botanika Sunucusu kusursuz sekilde calisiyor!`);
    console.log(`🌐 API Adresi: http://localhost:${PORT}`);
    console.log(`📄 Swagger Dokümantasyonu: http://localhost:${PORT}/api-docs`);
    console.log(`==================================================`);
});