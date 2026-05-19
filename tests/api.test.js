const request = require('supertest');
const API_URL = 'http://localhost:3000';

xdescribe('Botanika API - Tam Kapsamlı Entegrasyon Testleri', () => {
    let token = '';
    let bitkiId = '';

    // 🔥 TESTLER BAŞLAMADAN ÖNCE OTOMATİK GİRİŞ YAP
    beforeAll(async () => {
        // Kullanıcı adını sabitleyelim
        const testUser = `testuser_${Date.now()}`;
        
        // 1. Kayıt Ol (username ve password ile)
        await request(API_URL).post('/api/auth/register').send({
            username: testUser,
            password: "password123"
        });
        
        // 2. Giriş Yap (Aynı kullanıcı adı ile)
        const loginRes = await request(API_URL).post('/api/auth/login').send({
            username: testUser, 
            password: "password123"
        });
        
        token = loginRes.body.token;

        // 3. Test için bir bitki ekle
        const plantRes = await request(API_URL)
            .post('/api/plants')
            .set('Authorization', `Bearer ${token}`) // Buraya dikkat!
            .send({
                isim: "Test Bitkisi",
                tur: "Kaktüs",
                sulama_periyodu: 5,
                son_sulama_tarihi: "2026-05-18"
            });
        
        console.log("Bitki ekleme yanıtı:", plantRes.body);
        bitkiId = plantRes.body.id;
    });

    // Bölüm 2: Bitkiyi Sulama (POST /api/plants/:id/water)
    describe('Bitki Sulama İşlemleri', () => {
        test('✅ Bitki başarıyla sulanmalı ve tarih güncellenmeli', async () => {
            // Log ekleyerek ID gelip gelmediğini kontrol edebiliriz
            console.log("Test edilen Bitki ID:", bitkiId); 
            
            const response = await request(API_URL)
                .post(`/api/plants/${bitkiId}/water`) // ID buraya doğru gidiyor mu?
                .set('Authorization', `Bearer ${token}`);
            
            // Eğer hala 403 alıyorsan, ID muhtemelen undefined dönüyordur.
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Bitki başarıyla sulandı ve geçmişe kaydedildi.');
        });
    })});