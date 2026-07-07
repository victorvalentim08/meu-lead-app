import React from 'react';
import { useLeads } from './hooks/useLeads';
import { FormFiltros } from './components/FormFiltros';
import './index.css'; // Importa o arquivo de estilos que criamos

function App() {
  const { leads, loading, carregarLeads } = useLeads();

  // Recebe os filtros de Cidade e Estado enviados pelo FormFiltros
  const handleBuscar = async (filtros) => {
      const resultado = await carregarLeads(filtros);
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

        {/* Componente do Formulário já atualizado com Cidade/Estado */}
        <FormFiltros onBuscar={handleBuscar} loading={loading} />

        {leads.length > 0 && (
          <button onClick={exportarParaCSV} className="btn-export">
            📊 Exportar Resultados para Excel (.csv)
          </button>
        )}

        {/* Tabela de Resultados Completa */}
        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Nome da Empresa</th>
                <th>Endereço</th>
                <th>E-mail</th>
                <th>Presença Digital</th>
                <th>Reputação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Nenhum lead carregado. Preencha os filtros acima para iniciar sua prospecção regional.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const numeroLimpo = lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : '';
                  const linkWhatsapp = numeroLimpo ? `https://wa.me/55${numeroLimpo}?text=Olá,%20vi%20seu%20perfil%20no%20Google%20e%20gostaria%20de%20conversar!` : null;

                  // Link inteligente de busca direta no Google Maps para auditar avaliações de graça
                  const linkMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.nome + ' ' + lead.endereco)}`;

                  return (
                    <tr key={lead.id}>
                      <td className="lead-name">{lead.nome}</td>
                      <td className="lead-address">{lead.endereco}</td>
                      <td className="lead-email">{lead.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          
                          {/* Botão Dinâmico do Site */}
                          {lead.site && lead.site !== 'Não disponível' && lead.site !== 'Disponível na busca em breve' ? (
                            <a href={lead.site} target="_blank" rel="noreferrer" className="badge-link site">
                              🌐 Visitar Site
                            </a>
                          ) : (
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent(lead.nome + ' ' + lead.endereco + ' site oficial')}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="badge-link site-search"
                            >
                              🔍 Achar Site
                            </a>
                          )}

                          {/* Redes Sociais */}
                          <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent(lead.nome + ' ' + lead.endereco + ' instagram')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="badge-link insta"
                          >
                            📸 Buscar Insta
                          </a>
                        </div>
                      </td>
                      <td>
                        {/* Botão de Auditoria de Avaliações 100% Gratuito */}
                        <a href={linkMaps} target="_blank" rel="noreferrer" className="badge-link maps-review">
                          ⭐ Ver Estrelas/Maps
                        </a>
                      </td>
                      <td>
                        {linkWhatsapp ? (
                          <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="btn-wpp">
                            💬 Chamar no Wpp
                          </a>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '13px' }}>Sem telefone</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default App;