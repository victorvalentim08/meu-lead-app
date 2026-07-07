import React, { useState } from 'react';

export function FormFiltros({ onBuscar, loading }) {
  const [modoBusca, setModoBusca] = useState('cep'); 
  const [inputs, setInputs] = useState({ tipoEmpresa: '', cep: '', raio: '5', cidade: '', estado: 'CE' });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modoBusca === 'cep') {
      onBuscar({ tipoEmpresa: inputs.tipoEmpresa, cep: inputs.cep, raio: inputs.raio });
    } else {
      onBuscar({ tipoEmpresa: inputs.tipoEmpresa, cidade: inputs.cidade, estado: inputs.estado, raio: inputs.raio });
    }
  };

  return (
    <section className="filter-card">
      {/* Abas de seleção */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <button 
          type="button"
          onClick={() => setModoBusca('cep')}
          style={{ padding: '8px 16px', backgroundColor: modoBusca === 'cep' ? '#3b82f6' : 'transparent', color: '#fff', border: modoBusca === 'cep' ? 'none' : '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          📍 Buscar por CEP
        </button>
        <button 
          type="button"
          onClick={() => setModoBusca('regiao')}
          style={{ padding: '8px 16px', backgroundColor: modoBusca === 'regiao' ? '#3b82f6' : 'transparent', color: '#fff', border: modoBusca === 'regiao' ? 'none' : '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          🏢 Buscar por Cidade/Município
        </button>
      </div>

      <form onSubmit={handleSubmit} className="filter-form">
        <div className="form-group large">
          <label className="form-label">Segmento Comercial</label>
          <input type="text" name="tipoEmpresa" required placeholder="Ex: academia, restaurante" onChange={handleChange} className="form-input" />
        </div>

        {/* Campos Alternáveis */}
        {modoBusca === 'cep' ? (
          <div className="form-group">
            <label className="form-label">CEP de Origem</label>
            <input type="text" name="cep" required maxLength="9" placeholder="00000-000" onChange={handleChange} className="form-input" />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Cidade / Município</label>
              <input type="text" name="cidade" required placeholder="Ex: Pacatuba" onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Estado (UF)</label>
              <select name="estado" value={inputs.estado} onChange={handleChange} className="form-input" style={{ cursor: 'pointer' }}>
                <option value="CE">Ceará (CE)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="BA">Bahia (BA)</option>
              </select>
            </div>
          </>
        )}

        {/* Campo de Raio Fixo e Global para os dois modos */}
        <div className="form-group">
          <label className="form-label">Raio Máximo (KM)</label>
          <input type="number" name="raio" required min="1" max="50" value={inputs.raio} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <button type="submit" disabled={loading} className={`btn-submit ${loading ? 'disabled' : 'active'}`}>
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </div>
      </form>
    </section>
  );
}