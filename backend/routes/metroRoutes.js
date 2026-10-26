const express = require('express');
const router = express.Router();
const metroController = require('../controllers/metroController');

router.get('/stations', metroController.getMetroStations);
router.get('/fare', metroController.getMetroFare);

module.exports = router;
