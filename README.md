# 🌿 Botanika - Bitki Bakım ve Takip Sistemi

Botanika, kullanıcıların bitkilerinin sulama ve özel bakım (toprak değişimi, ilaçlama, aşılama) süreçlerini takip etmelerini sağlayan web tabanlı bir otomasyon sistemidir. Proje, katmanlı mimari (modüler yapı) prensiplerine uygun olarak geliştirilmiştir ve iş mantığı (business logic) API rotalarından ayrı tutulmuştur.

## 🚀 Kullanılan Teknolojiler
* **Backend:** Node.js, Express.js
* **Veritabanı:** SQLite
* **Test:** Jest
* **Veri İletişimi:** JSON

## ⚙️ Kurulum Adımları
Projeyi yerel bilgisayarınızda (local) çalıştırmak için aşağıdaki adımlar izlenmelidir:

1. Proje dosyaları bilgisayara indirilir.
2. Terminal (veya Komut İstemi) açılarak proje klasörünün ana dizinine geçiş yapılır.
3. Gerekli kütüphanelerin (bağımlılıklerin) yüklenmesi için aşağıdaki komut çalıştırılır:
   ```bash
   npm install
🏃‍♂️ Çalıştırma ve Test Adımları
Sunucuyu Başlatmak İçin:

Bash
npm start
(Alternatif olarak node server.js komutu da kullanılabilir.)
Sunucu başarılı bir şekilde başladığında http://localhost:3000 adresi üzerinden arayüze erişim sağlanır.

Unit Testleri Çalıştırmak İçin:
İş mantığı (business logic) fonksiyonlarının test edilmesi için Jest kütüphanesi yapılandırılmıştır. Test senaryolarını başlatmak için şu komut kullanılır:

Bash
npm test
🔌 API Kullanımı (Örnek Endpoint)
Sistemde frontend ile backend arasındaki istek ve cevap formatı standart JSON yapısı üzerine kurulmuştur.

1. Bitki Bakım Tarihi Güncelleme (Toprak, İlaç, Aşı)
URL: /api/plants/:id/care

Metot: PUT

Açıklama: Belirtilen ID değerine sahip bitkinin seçilen bakım türüne ait tarihini günceller. Bakım türü iş mantığı katmanında (utils) kontrol edilir ve veritabanı sütunlarına eşleştirilir.

Gerekli Yetki: Oturum açılmış olmalıdır (Bearer Token).

Örnek İstek (Request Body - JSON):

JSON
{
  "careType": "ilac",
  "date": "2026-05-19"
}
(Geçerli careType parametreleri: toprak, ilac, asi)

Örnek Başarılı Cevap (Response - JSON):

JSON
{
  "message": "Bakım tarihi başarıyla güncellendi!"
}