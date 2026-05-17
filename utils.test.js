// utils.test.js - Jest ile Unit Test Odası
const { calculatePlantStatus } = require('./utils');

test('Bitki sulama durumu hesaplama testi', () => {
    // Bugünün tarihini YYYY-MM-DD formatında dinamik olarak alalım
    const todayStr = new Date().toISOString().split('T')[0];

    // TEST 1: Bugün sulanmış ve 5 gün periyodu olan bitki sağlıklı (🟢) olmalı
    const test1 = calculatePlantStatus(todayStr, 5);
    expect(test1.daysLeft).toBe(5);
    expect(test1.status).toBe("Saglikli");

    // TEST 2: Zamanı geçmiş bitki acil (🔴) durumda olmalı
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const tenDaysAgoStr = tenDaysAgo.toISOString().split('T')[0];

    const test2 = calculatePlantStatus(tenDaysAgoStr, 5);
    expect(test2.daysLeft).toBeLessThanOrEqual(0);
    expect(test2.status).toBe("Acil");
});