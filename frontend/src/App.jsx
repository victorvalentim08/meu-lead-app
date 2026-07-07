import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({ cep: '', tipoEmpresa: '', raio: '' });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Manipulador de inputs genérico e limpo
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buscarLeads = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // SEGURANÇA: Comunicação direta com o backend local na porta 5000.
      // Em produção, essa URL viria de uma variável de ambiente (.env do frontend)
      const response = await axios.post('http://localhost:5000/api/leads', formData);
      setLeads(response.data);
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao buscar leads. Verifique se o backend está rodando ou se o CEP é válido.');
    } finally {
      setLoading(false);
    }
  };

  // SEGURANÇA E COMPATIBILIDADE: Geração de CSV à prova de falhas e injeções
  const exportarParaCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Nome', 'WhatsApp', 'E-mail', 'Site', 'Endereço\n'];
    
    const rows = leads.map(lead => {
      // Proteção contra CSV Injection: Remove caracteres que o Excel interpreta como fórmulas (=, +, -, @)
      // e escapa as aspas duplas internas para não quebrar as colunas.
      const sanitizar = (texto) => {
        if (!texto) return '';
        let limpo = texto.replace(/"/g, '""'); // Escapa aspas
        if (limpo.startsWith('=') || limpo.startsWith('+') || limpo.startsWith('-') || limpo.startsWith('@')) {
          limpo = `'${limpo}`; // Adiciona uma aspa simples antes para o Excel tratar estritamente como texto
        }
        return limpo;
      };

      return [
        `"${sanitizar(lead.nome)}"`,
        `"${sanitizar(lead.whatsapp)}"`,
        `"${sanitizar(lead.email)}"`,
        `"${sanitizar(lead.site)}"`,
        `"${sanitizar(lead.endereco)}"`
      ].join(',');
    });

    // O caractere \uFEFF (BOM) garante que o Excel abra o arquivo interpretando acentos do PT-BR corretamente
    const csvContent = "\uFEFF" + headers.join(',') + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Criação e destruição limpa do elemento de download (evita vazamento de memória)
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${formData.tipoEmpresa || 'empresas'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Libera o objeto da memória do navegador
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🎯 Meu Captador de Leads Locais</h2>
      
      <form onSubmit={buscarLeads} style={{ display: 'flex', gap: '15px', marginBottom: '30px', alignItems: 'flex-end' }}>
        <div>
          <label>CEP de Origem:</label><br />
          <input 
            type="text" 
            name="cep" 
            value={formData.cep} 
            onChange={handleChange} 
            required 
            maxLength="9"
            placeholder="00000-000" 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>
        <div>
          <label>O que buscar? (Ex: academia, restaurante):</label><br />
          <input 
            type="text" 
            name="tipoEmpresa" 
            value={formData.tipoEmpresa} 
            onChange={handleChange} 
            required 
            placeholder="Ex: loja, clinica" 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>
        <div>
          <label>Raio de Busca (KM):</label><br />
          <input 
            type="number" 
            name="raio" 
            value={formData.raio} 
            onChange={handleChange} 
            required 
            min="1"
            max="50" // Limite de segurança para não sobrecarregar requisições na API pública
            placeholder="Ex: 5" 
            style={{ padding: '8px', width: '100px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Buscando...' : 'Buscar Leads'}
        </button>
      </form>

      {leads.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={exportarParaCSV} 
            style={{ padding: '10px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📊 Exportar Resultados para Excel (CSV)
          </button>
        </div>
      )}

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', borderRadius: '4px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th>Nome da Empresa</th>
            <th>WhatsApp/Telefone</th>
            <th>E-mail</th>
            <th>Site</th>
            <th>Endereço</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                Nenhum lead carregado ainda. Preencha os campos acima.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id}>
                <td><strong>{lead.nome}</strong></td>
                <td>{lead.whatsapp}</td>
                <td>{lead.email}</td>
                <td>
                  {/* SEGURANÇA: rel="noreferrer" impede que o site de destino saiba de onde veio o clique, protegendo a URL do seu app */}
                  {lead.site !== 'Não disponível' ? (
                    <a href={lead.site} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>{lead.site}</a>
                  ) : 'Não disponível'}
                </td>
                <td>{lead.endereco}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
