import { useState, useEffect, useRef } from 'react';
import { API_URL, WS_URL } from '../../../config';

export default function useComponents() {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const ws = useRef(null);

  const fetchComponents = () => {
    fetch(`${API_URL}/api/components/`)
      .then((res) => res.json())
      .then((data) => {
        setComponents(data);
        // Filtruj tylko Materiały
        const materials = data.filter((comp) => comp.r === 'Materiał');
        setFilteredComponents(materials);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    ws.current = new window.WebSocket(`${WS_URL}/ws/warehouse/`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === 'refresh') {
        fetchComponents();
      }
    };

    fetchComponents();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return { components, filteredComponents, loading, fetchComponents };
}