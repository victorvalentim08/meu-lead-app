import React from 'react';
import { useLeads } from './hooks/useLeads';
import { FormFiltros } from './components/FormFiltros';
import './index.css'; // Importa o arquivo de estilos que criamos

function App() {
  const { leads, loading, carregarLeads } = useLeads();

  const handleBuscar = async (cep, tipoEmpresa) => {
    const resultado = await carregarLeads(cep, tipoEmpresa);
    if (!resultado.success) {
      alert(resultado.error);
    }
  };

  const exportarParaCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Nome', 'WhatsApp', 'E-mail', 'Site', 'Endereço\n'];
    const rows = leads.map(lead => {
      const sanitizar = (texto) => {
        if (!texto) return '';
        let limpo = texto.replace(/"/g, '""');
        if (limpo.startsWith('=') || limpo.startsWith('+') || limpo.startsWith('-') || limpo.startsWith('@')) {
          limpo = `'${limpo}`;
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

    const csvContent = "\uFEFF" + headers.join(',') + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_comerciais.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        
        <header className="app-header">
          <h1 className="app-title">
            🎯 LeadFinder Pro <span className="app-badge">SaaS Core</span>
          </h1>
          <p className="app-subtitle">Arquitetura limpa e desacoplada para distribuição comercial.</p>
        </header>

        {/* Componente do Formulário */}
        <FormFiltros onBuscar={handleBuscar} loading={loading} />

        {leads.length > 0 && (
          <button onClick={exportarParaCSV} className="btn-export">
            📊 Exportar Resultados para Excel (.csv)
          </button>
        )}

        {/* Tabela de Resultados */}
        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Nome da Empresa</th>
                <th>WhatsApp / Telefone</th>
                <th>E-mail</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    Nenhum lead carregado. Preencha os filtros acima para iniciar sua prospecção comercial.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="lead-name">{lead.nome}</td>
                    <td className="lead-phone">{lead.whatsapp}</td>
                    <td className="lead-email">{lead.email}</td>
                    <td className="lead-address">{lead.endereco}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default App;