const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

router.get('/', busController.getAllBuses);
router.get('/search', busController.getBusesByRoute);
router.get('/multimodal', busController.getMultimodalRoute);
router.get('/stops', busController.getStops);
router.get('/stops-with-aliases', busController.getStopsWithAliases);

module.exports = router;
