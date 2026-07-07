import { useState } from 'react';
import axios from 'axios';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarLeads = async (cep, tipoEmpresa) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/v1/leads', { cep, tipoEmpresa });
      setLeads(response.data);
      return { success: true };
    } catch (error) {
      console.error('Erro no Hook useLeads:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao conectar com o servidor.' 
      };
    } finally {
      setLoading(false);
    }
  };

  return { leads, loading, carregarLeads };
}