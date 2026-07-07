import React, { useState } from 'react';

export function FormFiltros({ onBuscar, loading }) {
  const [inputs, setInputs] = useState({ cep: '', tipoEmpresa: '' });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(inputs.cep, inputs.tipoEmpresa);
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
            placeholder="Ex: academia, clinica, restaurante" 
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