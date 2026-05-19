// middlewares/authMiddleware.js - Kullanıcı Kimlik Doğrulama Ara Yazılımı
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_botanika_key';

/**
 * Kimlik Doğrulama Middleware'i (Authentication)
 * İstek başlığındaki (Headers) Bearer token'ı kontrol eder ve doğrular.
 * Geçerli oturumlarda kullanıcı ID bilgisini 'req.userId' içerisine bağlar.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Başlık mevcutsa 'Bearer <token>' yapısından token string değerini ayıklar
    const token = authHeader && authHeader.split(' ')[1];

    // İstekte token bulunmuyorsa 401 (Yetkisiz Erişim) hatası döner
    if (!token) {
        return res.status(401).json({ error: 'Erişim engellendi. Giriş yapmalısınız.' });
    }

    // JWT token'ın doğruluğu ve süresi kontrol edilir
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        // Token geçersiz veya bozulmuşsa 403 (Yasaklı Erişim) hatası fırlatılır
        if (err) {
            return res.status(403).json({ error: 'Geçersiz token.' });
        }
        
        // Doğrulanan kullanıcı ID'si sonraki rotaların erişebilmesi için isteğe eklenir
        req.userId = decoded.userId;
        next(); // İstek-cevap döngüsünün sıradaki rotaya geçmesini sağlar
    });
}

module.exports = authenticateToken;