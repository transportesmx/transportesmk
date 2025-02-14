import React, { createContext, useState, useEffect } from 'react';
import ES from '../Traduccion/ES.json';
import EN from '../Traduccion/EN.json';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [hydrated, setHydrated] = useState(false); // nuevo estado
  const [idioma, setIdioma] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem("idioma");
      return savedLang === "EN" ? { nombre: 'EN', code: 'US' } : { nombre: 'ES', code: 'MX' };
    } else {
      return { nombre: 'ES', code: 'MX' };
    }
  });
  const [traduccion, setTraduccion] = useState(idioma.nombre === "EN" ? EN : ES);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem("idioma");
      if (savedLang === "EN") {
        setIdioma({ nombre: 'EN', code: 'US' });
      } else {
        setIdioma({ nombre: 'ES', code: 'MX' });
      }
      setHydrated(true); // Ya estamos en el cliente
    }
  }, []);

  useEffect(() => {
    if (idioma.nombre === "EN") {
      setTraduccion(EN);
      if (typeof window !== 'undefined') localStorage.setItem("idioma", "EN");
    } else {
      setTraduccion(ES);
      if (typeof window !== 'undefined') localStorage.setItem("idioma", "ES");
    }
  }, [idioma]);

  if (!hydrated) {
    // No renderizamos hasta que se hidrate, evitando discrepancias
    return null;
  }

  return (
    <AppContext.Provider value={{ data: [], idioma, traduccion, setIdioma, setData: () => {} }}>
      {children}
    </AppContext.Provider>
  );
};