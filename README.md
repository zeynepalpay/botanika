# 🌿 Botanika - Akıllı Bitki Bakım Sistemi

**Botanika**, bitkilerinizin bakım rutinlerini zahmetsizce takip etmenizi sağlayan web tabanlı bir otomasyon sistemidir. Katmanlı mimari prensiplerine uygun olarak geliştirilmiştir.

---

## 🚀 Temel Özellikler
- **Akıllı Filtreleme:** Bitkilerinizi "Acil", "Yaklaşanlar" ve "Sağlıklı" kategorilerine göre yönetin.
- **Bakım Takibi:** Bitkinizin son bakım tarihini güncelleyin; sistem bir sonraki tarihi hesaplar.
- **Güvenli Yönetim:** Oturum bazlı yetkilendirme ile verilerinizi koruyun.
- **Modüler Yapı:** Kolay genişletilebilir ve test edilebilir kod tabanı.

---

## 🛠️ Teknik Altyapı
- **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript
- **Backend:** Node.js, Express.js
- **Veritabanı:** SQLite
- **Test:** Jest (İş mantığı doğrulamaları için)

---

## ⚙️ Kurulum ve Çalıştırma

**1. Repoyu klonlayın ve klasöre gidin:**
```bash
git clone [repo-adresi]
cd botanika
2. Gerekli bağımlılıkları yükleyin:

Bash
npm install
3. Sunucuyu başlatın:

Bash
npm start
Sunucu başarıyla başladığında arayüze http://localhost:3000 adresi üzerinden erişebilirsiniz.

4. Testleri çalıştırın:

Bash
npm test
🔌 API Kullanımı
Sistem, frontend ve backend arasında standart JSON formatı ile haberleşir.

Bitki Bakım Tarihi Güncelleme
Belirtilen ID değerine sahip bitkinin bakım tarihini günceller.

URL: /api/plants/:id/care

Metot: PUT

Yetkilendirme: Bearer Token gereklidir.

Örnek İstek (JSON):

JSON
{
  "careType": "ilac",
  "date": "2026-05-19"
}
Örnek Başarılı Cevap:

JSON
{
  "message": "Bakım tarihi başarıyla güncellendi!"
}