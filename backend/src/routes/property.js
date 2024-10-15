const express = require('express');
const propertyController = require('../controllers/property');

const router = express.Router();

router.post('/calculate', propertyController.analyseProperty);

module.exports = router;