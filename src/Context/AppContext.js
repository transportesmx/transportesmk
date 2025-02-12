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
      return savedLang === "ES"
        ? { nombre: 'ES', code: 'MX' }
        : { nombre: 'EN', code: 'US' };
    } else {
      return { nombre: 'EN', code: 'US' }; // Valor predeterminado para SSR
    }
  });
  const [traduccion, setTraduccion] = useState(idioma.nombre === "ES" ? ES : EN);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem("idioma");
      if (savedLang === "ES") {
        setIdioma({
          nombre: 'ES',
          code: 'MX',
        });
      } else {
        setIdioma({
          nombre: 'EN',
          code: 'US',
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