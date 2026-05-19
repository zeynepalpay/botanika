🌿 Botanika - Akıllı Bitki Bakım Sistemi
Botanika, bitkilerinizin bakım rutinlerini (sulama, toprak değişimi, ilaçlama, aşılama) zahmetsizce takip etmenizi sağlayan web tabanlı bir otomasyon sistemidir. Katmanlı mimari prensiplerine uygun olarak geliştirilen sistemde, iş mantığı (business logic) API rotalarından ayrıştırılarak modüler bir yapı sunulmuştur.

🚀 Temel Özellikler
Akıllı Filtreleme: Bitkilerinizi "Acil", "Yaklaşanlar" ve "Sağlıklı" kategorilerine göre anında yönetin.

Bakım Takibi: Bitkinizin son bakım tarihini güncelleyin; sistem bir sonraki tarihi otomatik hesaplar.

Güvenli Yönetim: Oturum bazlı yetkilendirme ile verilerinizi koruyun.

Modüler Yapı: Test edilebilir ve genişletilebilir kod tabanı.

🛠️ Teknik Altyapı
Frontend: HTML5, CSS3 (Bootstrap 5), JavaScript

Backend: Node.js, Express.js

Veritabanı: SQLite

Test: Jest (İş mantığı doğrulamaları için)

⚙️ Kurulum ve Çalıştırma
Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları izleyin:

1. Repoyu klonlayın ve klasöre gidin:

Bash
git clone [repo-adresi]
cd botanika
2. Gerekli bağımlılıkları yükleyin:

Bash
npm install
3. Sunucuyu başlatın:

Bash
npm start
Sunucu başarıyla başladığında arayüze http://localhost:3000 adresi üzerinden erişebilirsiniz.

4. Testleri çalıştırma:
İş mantığını doğrulamak için geliştirilen Jest testlerini çalıştırmak için:

Bash
npm test
🔌 API Kullanımı
Sistem, frontend ve backend arasında standart JSON formatı ile haberleşir.

Bitki Bakım Tarihi Güncelleme
Belirtilen ID değerine sahip bitkinin bakım tarihini günceller.

URL: /api/plants/:id/care

Metot: PUT

Yetkilendirme: Bearer Token (Oturum açılmış olmalıdır)

Örnek İstek (JSON):

JSON
{
  "careType": "ilac",
  "date": "2026-05-19"
}
(Geçerli careType parametreleri: toprak, ilac, asi)

Örnek Başarılı Cevap:

JSON
{
  "message": "Bakım tarihi başarıyla güncellendi!"
}