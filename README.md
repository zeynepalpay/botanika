🌿 Botanika - Akıllı Bitki Bakım Sistemi
Botanika, bitkilerinizin bakım rutinlerini zahmetsizce takip etmenizi sağlayan, katmanlı mimari prensiplerine uygun olarak geliştirilmiş web tabanlı bir otomasyon sistemidir.

🚀 Temel Özellikler
Akıllı Filtreleme: Bitkilerinizi "Acil", "Yaklaşanlar" ve "Sağlıklı" kategorilerine göre dinamik olarak yönetin.

Bakım Takibi: Bitkinizin son bakım tarihini güncelleyin; sistem bir sonraki tarihi otomatik olarak hesaplar.

Modüler Yapı: Kolay genişletilebilir, test edilebilir ve sürdürülebilir bir kod tabanı.

🛠️ Teknik Altyapı
Frontend: HTML5, CSS3 (Bootstrap 5), JavaScript

Backend: Node.js, Express.js

Veritabanı: SQLite

Güvenlik: JWT (JSON Web Token) tabanlı yetkilendirme, Middleware katmanı ile korunan API uç noktaları.

Test: Jest & Supertest (Unit ve Entegrasyon testleri).

🛡️ Güvenlik ve Veri Doğrulama
Botanika, kullanıcı hatalarını minimize etmek ve sistemi korumak adına çok katmanlı bir doğrulama mekanizmasına sahiptir:

İstemci (Frontend) Doğrulaması: HTML5 ve JavaScript ile giriş sınırlandırmaları (tarih kontrolleri, zorunlu alanlar).

Sunucu (Backend) Doğrulaması: Controller katmanında gelen verilerin mantıksal kontrolü (örn: 1-365 gün sulama periyodu sınırı, gelecek tarih engelleme).

API Güvenliği: Yetkisiz erişim denemeleri, middleware katmanı tarafından 403 Forbidden yanıtı ile engellenerek sistemin veri bütünlüğü korunmaktadır.

⚙️ Kurulum ve Çalıştırma
Repoyu klonlayın ve klasöre gidin:

Bash
git clone [repo-adresi]
cd botanika
Gerekli bağımlılıkları yükleyin:

Bash
npm install
Sunucuyu başlatın:

Bash
npm start
Sunucu başarıyla başladığında arayüze http://localhost:3000 adresi üzerinden erişebilirsiniz.

Testleri çalıştırın:

Bash
npm test
Not: İş mantığı testleri (Unit Tests) %100 başarı oranıyla çalışmaktadır.

🔌 API Kullanımı
Sistem, frontend ve backend arasında standart JSON formatı ile haberleşir.

Bitki Bakım Tarihi Güncelleme

URL: /api/plants/:id/water

Metot: POST

Yetkilendirme: Bearer Token gereklidir.

Örnek İstek (JSON):

JSON
{
  "date": "2026-05-19"
}
Örnek Başarılı Cevap:

JSON
{
  "message": "Bitki başarıyla sulandı ve geçmişe kaydedildi."
}