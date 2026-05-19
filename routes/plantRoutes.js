// routes/plantRoutes.js - Temiz ve Sadece Yönlendirme Yapan Rota Katmanı
const express = require('express');
const router = express.Router();

// Controller katmanı ve Middleware katmanı çağrılır
const plantController = require('../controllers/plantController');
const authenticateToken = require('../middlewares/authMiddleware');

// 🔒 Tüm endpointler için token koruma kapısı aktif edilir
router.use(authenticateToken);

// İlgili HTTP metotları doğrudan controller fonksiyonlarına bağlanır
router.get('/', plantController.getAllPlants);
router.post('/', plantController.createPlant);
router.delete('/history/:logId', plantController.deleteHistoryLog);
router.get('/:id/history', plantController.getPlantHistory);
router.put('/:id', plantController.updatePlant);
router.delete('/:id', plantController.deletePlant);
router.post('/:id/water', plantController.waterPlant);
router.put('/:id/care', plantController.updatePlantCare);

module.exports = router;