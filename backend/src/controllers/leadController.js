const leadService = require('../services/leadService');

class LeadController {
    async obterLeads(req, res) {
        try {
            // Passa o body completo (pode conter cep OU cidade/estado)
            const leads = await leadService.buscarLeads(req.body);
            return res.json(leads);
        } catch (error) {
            if (error.message === 'CEP_NOT_FOUND') {
                return res.status(400).json({ error: 'O CEP informado não foi encontrado.' });
            }
            console.error("Erro no controlador de busca:", error.message);
            return res.status(500).json({ error: 'Erro ao processar busca.' });
        }
    }
}

module.exports = new LeadController();