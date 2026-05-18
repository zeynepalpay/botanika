// utils.test.js - Projenin İş Mantığı ve Fonksiyon Testleri
const { calculatePlantStatus, getColumnNameByCareType } = require('./utils');

describe('Botanika Projesi - Fonksiyonel Unit Test Senaryoları', () => {

    // 1. BÖLÜM: Bitki durumunu ve kalan günü hesaplayan fonksiyonun testleri
    describe('calculatePlantStatus Fonksiyonu Testleri', () => {
        
        test('Sulamaya daha vakit varsa durumun Saglikli görünmesi gerekir', () => {
            const bugunStr = new Date().toISOString().split('T')[0];
            
            // Bugün sulanan ve 5 gün periyodu olan bitkinin kalan günü hesaplanır
            const sonuc = calculatePlantStatus(bugunStr, 5);
            
            // Zaman dilimi ve saat kaymalarına karşı kalan günün geçerli aralıkta olduğu doğrulanır
            expect(sonuc.daysLeft).toBeGreaterThan(0);
            expect(sonuc.status).toBe("Saglikli");
        });

        test('Sulama zamanı geçmiş olan bitki Acil durumuna düşmelidir', () => {
            const onGunOnce = new Date();
            onGunOnce.setDate(onGunOnce.getDate() - 10);
            const onGunOnceStr = onGunOnce.toISOString().split('T')[0];

            // 5 gün periyodu olan bitki 10 gün önce sulandıysa Acil durumuna geçmesi test edilir
            const sonuc = calculatePlantStatus(onGunOnceStr, 5);
            expect(sonuc.daysLeft).toBeLessThanOrEqual(0);
            expect(sonuc.status).toBe("Acil");
        });

        test('Sulamaya 1 veya 2 gün kaldıysa durumun Yakin gelmesi gerekir', () => {
            const dun = new Date();
            dun.setDate(dun.getDate() - 1);
            const dunStr = dun.toISOString().split('T')[0];

            // 3 gün periyodu olan bitki dün sulandıysa durumun Yakın (Yakin) gelmesi doğrulanır
            const sonuc = calculatePlantStatus(dunStr, 3);
            expect(sonuc.status).toBe("Yakin");
        });
    });

    // 2. BÖLÜM: Bakım butonlarından gelen kelimeleri veritabanı sütun adına çeviren fonksiyonun testleri
    describe('getColumnNameByCareType Fonksiyonu Testleri', () => {
        
        test('Frontend katmanından gelen geçerli bakım tipleri doğru sütun adlarıyla eşleşmelidir', () => {
            expect(getColumnNameByCareType('toprak')).toBe('toprak_bakimi');
            expect(getColumnNameByCareType('ilac')).toBe('ilaclama_notu');
            expect(getColumnNameByCareType('asi')).toBe('asilama_durumu');
        });

        test('Sistemde tanımlı olmayan geçersiz bir bakım tipi gelirse null dönmelidir', () => {
            expect(getColumnNameByCareType('gubreleme')).toBeNull();
            expect(getColumnNameByCareType('')).toBeNull();
            expect(getColumnNameByCareType(null)).toBeNull();
        });
    });
});