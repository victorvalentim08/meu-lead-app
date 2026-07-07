import React, { useState } from 'react';

export function FormFiltros({ onBuscar, loading }) {
  // Adicionado o raio de volta no estado inicial (padrão 5km)
  const [inputs, setInputs] = useState({ cep: '', tipoEmpresa: '', raio: '5' });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Passa os três valores agora para o hook carregar os dados
    onBuscar(inputs.cep, inputs.tipoEmpresa, inputs.raio);
  };

  return (
    <section className="filter-card">
      <form onSubmit={handleSubmit} className="filter-form">
        
        <div className="form-group">
          <label className="form-label">CEP de Origem</label>
          <input 
            type="text" 
            name="cep" 
            required 
            maxLength="9"
            placeholder="00000-000" 
            onChange={handleChange} 
            className="form-input"
          />
        </div>

        <div className="form-group large">
          <label className="form-label">Segmento Comercial</label>
          <input 
            type="text" 
            name="tipoEmpresa" 
            required 
            placeholder="Ex: academia, restaurante" 
            onChange={handleChange} 
            className="form-input"
          />
        </div>

        {/* Campo de Raio adicionado de volta com a nova classe */}
        <div className="form-group">
          <label className="form-label">Raio Máximo (KM)</label>
          <input 
            type="number" 
            name="raio" 
            required 
            min="1"
            max="50"
            value={inputs.raio}
            onChange={handleChange} 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <button 
            type="submit" 
            disabled={loading} 
            className={`btn-submit ${loading ? 'disabled' : 'active'}`}
          >
            {loading ? 'Buscando Leads...' : 'Pesquisar'}
          </button>
        </div>

      </form>
    </section>
  );
}