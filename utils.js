// utils.js - Projenin Hesaplama ve İş Mantığı (Business Logic) Katmanı

/**
 * Son sulama tarihine ve periyoda bakarak kalan günü ve bitki durumunu hesaplayan fonksiyon.
 * @param {string} lastWateredDate - "YYYY-MM-DD" formatında gelen son sulama tarihi
 * @param {number} periodDays - Bitkinin kaç günde bir sulanması gerektiği (periyot)
 */
function calculatePlantStatus(lastWateredDate, periodDays) {
    const lastWatered = new Date(lastWateredDate);
    const today = new Date();

    // Saat farklarından dolayı gün hesabında hata oluşmaması için saatler sıfırlanır
    lastWatered.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Bir sonraki sulama tarihi hesaplanır (Son sulama gününe periyot eklenir)
    const nextWateringDate = new Date(lastWatered);
    nextWateringDate.setDate(lastWatered.getDate() + periodDays);

    // İki tarih arasındaki milisaniye farkı alınarak matematiksel olarak güne çevrilir
    const timeDiff = nextWateringDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let status = "Saglikli"; 
    
    // Orijinal Matematiksel Mantık: Kalan gün sayısına göre durum etiketi belirlenir
    if (daysLeft <= 0) {
        status = "Acil";      // Sulama günü gelmiş veya geçmişse Acil (🔴)
    } else if (daysLeft <= 2) {
        status = "Yakin";     // Sulamaya 1 veya 2 gün kaldıysa Yakın (🟡)
    } else {
        status = "Saglikli";  // Daha vakit varsa Sağlıklı (🟢)
    }

    return { daysLeft, status };
}

/**
 * Frontend'den gelen bakım tipine (toprak, ilac, asi) göre veritabanındaki sütun adını eşleştiren fonksiyon.
 * @param {string} careType - Frontend'den gelen buton tipi
 */
function getColumnNameByCareType(careType) {
    if (!careType) return null;
    
    // Gelen kelimeye göre veritabanındaki gerçek sütun isimleri eşleştirilir
    const types = {
        'toprak': 'toprak_bakimi',
        'ilac': 'ilaclama_notu',
        'asi': 'asilama_durumu'
    };
    
    // Listede eşleşme varsa sütun adı döndürülür, yoksa null fırlatılır
    return types[careType] || null;
}

// Fonksiyonlar dışarı aktarılır; böylece server.js ve test dosyası tarafından erişilebilir hale gelir
module.exports = { calculatePlantStatus, getColumnNameByCareType };