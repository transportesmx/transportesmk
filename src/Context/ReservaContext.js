import React, { createContext, useReducer, useContext } from 'react';

const ReservaContext = createContext();

const initialState = {
  paso: 1,
  // Búsqueda
  origen: '',
  destino: '',
  origenCoords: null,
  destinoCoords: null,
  origenPlaceId: '',
  destinoPlaceId: '',
  fechaIda: '',
  horaIda: '12:00',
  numPasajeros: 1,
  tipoViaje: 'sencillo',
  fechaRegreso: '',
  horaRegreso: '12:00',
  // Ruta
  distancia: '',
  distanciaMetros: 0,
  duracion: '',
  duracionSegundos: 0,
  directions: null,
  // Vehículo
  vehiculoId: '',
  vehiculoNombre: '',
  precioIda: 0,
  precioTotal: 0,
  desglose: null,
  // Cliente
  clienteNombre: '',
  clienteEmail: '',
  clienteTelefono: '',
  // Pago
  metodoPago: '',
  stripeSessionId: '',
  estadoPago: '',
  // Confirmación
  reservaId: '',
  pdfUrl: '',
  calendarEventId: '',
};

function reservaReducer(state, action) {
  switch (action.type) {
    case 'SET_PASO':
      return { ...state, paso: action.payload };
    case 'SET_BUSQUEDA':
      return { ...state, ...action.payload };
    case 'SET_RUTA':
      return { ...state, ...action.payload };
    case 'SET_VEHICULO':
      return { ...state, ...action.payload };
    case 'SET_CLIENTE':
      return { ...state, ...action.payload };
    case 'SET_PAGO':
      return { ...state, ...action.payload };
    case 'SET_CONFIRMACION':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function ReservaProvider({ children }) {
  const [state, dispatch] = useReducer(reservaReducer, initialState);

  return (
    <ReservaContext.Provider value={{ reserva: state, dispatch }}>
      {children}
    </ReservaContext.Provider>
  );
}

export function useReserva() {
  const context = useContext(ReservaContext);
  if (!context) throw new Error('useReserva debe usarse dentro de ReservaProvider');
  return context;
}
