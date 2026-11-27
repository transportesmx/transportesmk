
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import ES from "../Traduccion/ES.json";
import EN from "../Traduccion/EN.json";

export const AppContext = createContext();

const IDIOMA_ES = { nombre: "ES", code: "MX" };
const IDIOMA_EN = { nombre: "EN", code: "US" };

// Normaliza cualquier valor recibido desde el selector de idioma.
const normalizarIdioma = (valor) => {
  const nombre =
    typeof valor === "string"
      ? valor
      : valor?.nombre;

  return nombre === "EN" ? IDIOMA_EN : IDIOMA_ES;
};

export const AppProvider = ({ children }) => {
  // Siempre inicia en español para mantener el mismo primer render
  // en el servidor y en el navegador.
  const [idioma, setIdiomaInterno] = useState(IDIOMA_ES);

  // Carga el idioma guardado cuando el navegador está disponible.
  useEffect(() => {
    try {
      const idiomaGuardado = localStorage.getItem("idioma");

      if (idiomaGuardado) {
        setIdiomaInterno(normalizarIdioma(idiomaGuardado));
      }
    } catch (error) {
      console.warn("No se pudo recuperar el idioma guardado:", error);
    }
  }, []);

  // Función compatible con el selector actual del Navbar.
  const setIdioma = useCallback((nuevoIdioma) => {
    const idiomaNormalizado = normalizarIdioma(nuevoIdioma);

    setIdiomaInterno(idiomaNormalizado);

    try {
      localStorage.setItem("idioma", idiomaNormalizado.nombre);
    } catch (error) {
      console.warn("No se pudo guardar el idioma:", error);
    }
  }, []);

  // Las traducciones siempre corresponden al idioma seleccionado.
  const traduccion = idioma.nombre === "EN" ? EN : ES;

  return (
    <AppContext.Provider
      value={{
        data: [],
        idioma,
        traduccion,
        setIdioma,
        setData: () => {},
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
