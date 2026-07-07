const leadService = require('../services/leadService');

class LeadController {
    async obterLeads(req, res) {
        const { cep, tipoEmpresa } = req.body;

        try {
            const leads = await leadService.buscarLeads(cep, tipoEmpresa);
            console.log(`Busca finalizada com sucesso.`);
            return res.json(leads);
        } catch (error) {
            if (error.message === 'CEP_NOT_FOUND') {
                return res.status(400).json({ error: 'CEP não encontrado.' });
            }
            console.error("Erro na busca de contingência:", error.message);
            return res.status(500).json({ error: 'Erro ao processar busca.' });
        }
    }
}

module.exports = new LeadController();