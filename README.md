🌿 Botanika - Akıllı Bitki Bakım Sistemi
Botanika, bitkilerinizin bakım rutinlerini (sulama, toprak değişimi, ilaçlama, aşılama) zahmetsizce takip etmenizi sağlayan web tabanlı bir otomasyon sistemidir. Katmanlı mimari prensiplerine uygun olarak geliştirilen sistemde iş mantığı (business logic) API rotalarından ayrıştırılmıştır.

🚀 Temel Özellikler
Akıllı Filtreleme: Bitkilerinizi "Acil", "Yaklaşanlar" ve "Sağlıklı" kategorilerine göre anında yönetin.

Bakım Takibi: Bitkinizin son bakım tarihini güncelleyin; sistem bir sonraki tarihi otomatik hesaplar.

Güvenli Yönetim: Oturum bazlı yetkilendirme ile kişisel bitki verilerinizi koruyun.

Modüler Yapı: Kolay genişletilebilir ve test edilebilir kod tabanı.

🛠️ Teknik Altyapı
Frontend: HTML5, CSS3 (Bootstrap 5), JavaScript.

Backend: Node.js, Express.js.

Veritabanı: SQLite.

Test: Jest (İş mantığı doğrulamaları için).

⚙️ Kurulum ve Çalıştırma
Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları izleyin:

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

Testleri çalıştırma:
İş mantığını doğrulamak için geliştirilen Jest testlerini çalıştırmak için:

Bash
npm test
🔌 API Kullanımı
Sistem, frontend ve backend arasında standart JSON formatı ile haberleşir.

Bitki Bakım Tarihi Güncelleme
Belirtilen ID değerine sahip bitkinin bakım tarihini günceller. Bakım türü iş mantığı katmanında (utils) doğrulanır.

URL: /api/plants/:id/care

Metot: PUT

Yetkilendirme: Bearer Token (Oturum açılmış olmalıdır).

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