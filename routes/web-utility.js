'use strict'

var express = require('express');
var WebUtilityController = require('../controllers/web-utility');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');
var vip = require('../middlewares/vip');

var multer = require('multer');
var md_upload = multer({ dest: './uploads/web-utility' });
var md_upload = md_upload.any();

// Rutas de prueba
router.post('/datos-autor', WebUtilityController.datosAutor);

// Utility
router.get('/to-kb-or-mb/:size', WebUtilityController.toKBorMB);
router.get('/hex-to-rgb/:hex', WebUtilityController.hexToRGBOut);
router.get('/to-linear-gradient-progress/:color', WebUtilityController.toLinearGradientProgress);
router.get('/harshify/:length', WebUtilityController.toLinearGradientProgress);

router.post('/scrap', WebUtilityController.scrapeMetatags);
router.post('/linkify', WebUtilityController.linkify);

module.exports = router;
