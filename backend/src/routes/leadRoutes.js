const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// Garante que o método chamado aqui bate com o nome do controlador
router.post('/leads', leadController.obterLeads);

module.exports = router;