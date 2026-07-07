const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// Padrão de endpoint limpo
router.post('/leads', leadController.obterLeads);

module.exports = router;