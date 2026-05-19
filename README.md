# 🌿 Botanika - Akıllı Bitki Bakım Sistemi

**Botanika**, bitkilerinizin bakım rutinlerini zahmetsizce takip etmenizi sağlayan, katmanlı mimari prensiplerine uygun olarak geliştirilmiş web tabanlı bir otomasyon sistemidir.

---

# 🚀 Temel Özellikler

### 🌱 Akıllı Filtreleme
Bitkilerinizi **"Acil"**, **"Yaklaşanlar"** ve **"Sağlıklı"** kategorilerine göre dinamik olarak yönetin.

### 💧 Bakım Takibi
Bitkinizin son bakım tarihini güncelleyin; sistem bir sonraki sulama tarihini otomatik olarak hesaplasın.

### 🧩 Modüler Yapı
Kolay genişletilebilir, test edilebilir ve sürdürülebilir bir kod tabanı.

### 🔐 Güvenli Kullanıcı Sistemi
JWT tabanlı kullanıcı doğrulama sistemi ile her kullanıcı yalnızca kendi verilerine erişebilir.

### 📑 Swagger API Dokümantasyonu
REST API uç noktalarını Swagger arayüzü üzerinden test edebilir ve inceleyebilirsiniz.

---

# 🛠️ Teknik Altyapı

| Teknoloji | Açıklama |
|---|---|
| **Frontend** | HTML5, CSS3, Bootstrap 5, JavaScript |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | SQLite |
| **Kimlik Doğrulama** | JWT (JSON Web Token) |
| **Şifre Güvenliği** | bcryptjs |
| **API Dokümantasyonu** | Swagger UI |
| **Test** | Jest & Supertest |

---

# 🏗️ Proje Mimarisi

Proje, sürdürülebilirlik ve okunabilirlik amacıyla katmanlı mimari yapısına uygun şekilde geliştirilmiştir.

Botanika/
│
├── config/
│   └── swagger.js
│
├── controllers/
│   ├── authController.js
│   └── plantController.js
│
├── middlewares/
│   └── authMiddleware.js
│
├── models/
│   └── database.js
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
│
├── routes/
│   ├── authRoutes.js
│   └── plantRoutes.js
│
├── tests/
│   └── api.test.js
│
├── .env
├── .gitignore
├── botanika.db
├── package-lock.json
├── package.json
├── README.md
├── server.js
├── utils.js
└── utils.test.js

🛡️ Güvenlik ve Veri Doğrulama

Botanika, kullanıcı hatalarını minimize etmek ve sistem güvenliğini sağlamak amacıyla çok katmanlı doğrulama mekanizmaları kullanmaktadır.

✅ İstemci (Frontend) Doğrulaması
HTML5 form doğrulamaları
JavaScript tabanlı giriş kontrolleri
Zorunlu alan kontrolü
Tarih doğrulamaları
✅ Sunucu (Backend) Doğrulaması

Controller katmanında gelen veriler mantıksal olarak kontrol edilmektedir.

Örnekler:

Sulama periyodu yalnızca belirli aralıkta olabilir
Gelecek tarihli sulama kayıtları engellenir
Eksik veri girişleri reddedilir
✅ API Güvenliği

JWT tabanlı middleware sistemi sayesinde:

Yetkisiz erişimler engellenir
Korumalı endpointlere yalnızca doğrulanmış kullanıcılar erişebilir
Geçersiz token durumlarında 403 Forbidden yanıtı döndürülür
⚙️ Kurulum ve Çalıştırma
1️⃣ Repoyu klonlayın
git clone [repo-adresi]
cd botanika
2️⃣ Gerekli bağımlılıkları yükleyin
npm install
3️⃣ Sunucuyu başlatın
npm start

Sunucu başarıyla çalıştığında:

🌐 Uygulama: http://localhost:3000
📄 Swagger Dokümantasyonu: http://localhost:3000/api-docs

adreslerinden erişebilirsiniz.

🧪 Testler

Projede unit ve entegrasyon testleri bulunmaktadır.

Testleri çalıştırmak için:

npm test

✅ İş mantığı testleri başarıyla çalışmaktadır.

🔌 API Kullanımı

Sistem, frontend ve backend arasında standart JSON formatı ile haberleşmektedir.

💧 Bitki Bakım Tarihi Güncelleme
Endpoint
POST /api/plants/:id/water
Yetkilendirme
Bearer Token gereklidir.
📥 Örnek İstek
{
  "date": "2026-05-19"
}
📤 Örnek Başarılı Yanıt
{
  "message": "Bitki başarıyla sulandı ve geçmişe kaydedildi."
}
📸 Arayüz Özellikleri
Modern Glassmorphism tasarım
Responsive yapı
Durum rozetleri
Hover animasyonları
Dinamik kart sistemi
Filtreleme butonları
Modern modal ve form tasarımları
👨‍💻 Geliştirici Notu

Bu proje, modern web teknolojileri kullanılarak:

RESTful API mimarisi
Katmanlı yazılım mimarisi
Güvenli kullanıcı doğrulama sistemi
CRUD operasyonları
Middleware yapısı
Swagger dokümantasyonu
Unit & entegrasyon testleri

esas alınarak geliştirilmiştir.