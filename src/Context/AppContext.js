import React, { createContext, useState, useEffect } from 'react';
import ES from '../Traducciones/ES.json';
import EN from '../Traducciones/EN.json';

// Crea el contexto
export const AppContext = createContext();

// Crea el proveedor del contexto
export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [idioma, setIdioma] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem("idioma");
      return savedLang === "EN"
        ? { nombre: 'EN', code: 'US' }
        : { nombre: 'ES', code: 'MX' };
    } else {
      return { nombre: 'ES', code: 'MX' }; // Valor predeterminado para SSR
    }
  });
  const [traduccion, setTraduccion] = useState(idioma.nombre === "EN" ? EN : ES);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem("idioma");
      if (savedLang === "EN") {
        setIdioma({
          nombre: 'EN',
          code: 'US',
        });
      } else {
        setIdioma({
          nombre: 'ES',
          code: 'MX',
        });
      }
    }
  }, []);

  useEffect(() => {
    if (idioma.nombre === "EN") {
      setTraduccion(EN);
      if (typeof window !== 'undefined') {
        localStorage.setItem("idioma", "EN");
      }
    } else {
      setTraduccion(ES);
      if (typeof window !== 'undefined') {
        localStorage.setItem("idioma", "ES");
      }
    }
  }, [idioma]);

  return (
    <AppContext.Provider value={{ 
      data,
      idioma,
      traduccion,
      setIdioma,
      setData
    }}>
      {children}
    </AppContext.Provider>
  );
};