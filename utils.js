// utils.js - İş Mantığı (Business Logic) Katmanı

/**
 * Son sulama tarihine ve periyoda bakarak kalan günü ve bitki durumunu hesaplar.
 * @param {string} lastWateredDate - "YYYY-MM-DD" formatında son sulama tarihi
 * @param {number} periodDays - Kaç günde bir sulanması gerektiği
 * @returns {object} { daysLeft: sayı, status: "Saglikli"|"Yakin"|"Acil" }
 */
function calculatePlantStatus(lastWateredDate, periodDays) {
    const lastWatered = new Date(lastWateredDate);
    const today = new Date();

    // Saat farklarından dolayı yanlış hesap yapmamak için saatleri sıfırlıyoruz
    lastWatered.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Bir sonraki sulama tarihini buluyoruz (Son sulama + Periyot)
    const nextWateringDate = new Date(lastWatered);
    nextWateringDate.setDate(lastWatered.getDate() + periodDays);

    // İki tarih arasındaki milisaniye farkını güne çeviriyoruz
    const timeDiff = nextWateringDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Durum kontrolü (Badge/Rozet Mantığı)
    let status = "Saglikli"; 
    
    if (daysLeft <= 0) {
        status = "Acil";      // Sulama zamanı gelmiş veya geçmiş 🔴
    } else if (daysLeft <= 2) {
        status = "Yakin";     // Sulamaya 1 veya 2 gün kalmış 🟡
    } else {
        status = "Saglikli";  // Keyfi yerinde, daha vakit var 🟢
    }

    return { daysLeft, status };
}

module.exports = { calculatePlantStatus };