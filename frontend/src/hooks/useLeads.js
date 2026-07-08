import { useState } from 'react';
import axios from 'axios';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarLeads = async (filtros) => {
    setLoading(true);
    try {
      const response = await axios.post('https://meu-lead-app.onrender.com/api/v1/leads', filtros);
      setLeads(response.data);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.response?.data?.error || 'Erro na conexão' };
    } finally {
      setLoading(false);
    }
  };

  return { leads, loading, carregarLeads };
}