import React, { useMemo, useState } from 'react';
import { useReserva } from '@/Context/ReservaContext';

const PAISES = [
  { iso: 'MX', nombre: 'México', lada: '+52', ejemplo: '415 123 4567' },
  { iso: 'US', nombre: 'Estados Unidos', lada: '+1', ejemplo: '202 555 0123' },
  { iso: 'CA', nombre: 'Canadá', lada: '+1', ejemplo: '416 555 0123' },
  { iso: 'ES', nombre: 'España', lada: '+34', ejemplo: '612 345 678' },
  { iso: 'GB', nombre: 'Reino Unido', lada: '+44', ejemplo: '7700 900123' },
  { iso: 'FR', nombre: 'Francia', lada: '+33', ejemplo: '6 12 34 56 78' },
  { iso: 'DE', nombre: 'Alemania', lada: '+49', ejemplo: '1512 3456789' },
  { iso: 'IT', nombre: 'Italia', lada: '+39', ejemplo: '312 345 6789' },
  { iso: 'PT', nombre: 'Portugal', lada: '+351', ejemplo: '912 345 678' },
  { iso: 'AR', nombre: 'Argentina', lada: '+54', ejemplo: '11 2345 6789' },
  { iso: 'BR', nombre: 'Brasil', lada: '+55', ejemplo: '11 91234 5678' },
  { iso: 'CO', nombre: 'Colombia', lada: '+57', ejemplo: '300 123 4567' },
  { iso: 'CL', nombre: 'Chile', lada: '+56', ejemplo: '9 1234 5678' },
  { iso: 'PE', nombre: 'Perú', lada: '+51', ejemplo: '912 345 678' },
  { iso: 'CR', nombre: 'Costa Rica', lada: '+506', ejemplo: '8312 3456' },
  { iso: 'PA', nombre: 'Panamá', lada: '+507', ejemplo: '6123 4567' },
  { iso: 'GT', nombre: 'Guatemala', lada: '+502', ejemplo: '5123 4567' },
  { iso: 'SV', nombre: 'El Salvador', lada: '+503', ejemplo: '7012 3456' },
  { iso: 'HN', nombre: 'Honduras', lada: '+504', ejemplo: '9123 4567' },
  { iso: 'DO', nombre: 'República Dominicana', lada: '+1', ejemplo: '809 555 0123' },
  { iso: 'AU', nombre: 'Australia', lada: '+61', ejemplo: '412 345 678' },
  { iso: 'JP', nombre: 'Japón', lada: '+81', ejemplo: '90 1234 5678' },
  { iso: 'CN', nombre: 'China', lada: '+86', ejemplo: '131 2345 6789' },
  { iso: 'IN', nombre: 'India', lada: '+91', ejemplo: '98765 43210' },
  { iso: 'AE', nombre: 'Emiratos Árabes Unidos', lada: '+971', ejemplo: '50 123 4567' },
];

const CAMPO_OSCURO =
  'w-full rounded-lg border border-white/30 bg-white/[0.07] px-3 py-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-blue-500/35 focus:shadow-[0_0_14px_rgba(59,130,246,0.22)]';

function separarTelefono(telefonoGuardado) {
  const valor = String(telefonoGuardado || '').trim();

  if (!valor.startsWith('+')) {
    return { lada: '+52', numero: valor };
  }

  const pais = [...PAISES]
    .sort((a, b) => b.lada.length - a.lada.length)
    .find(item => valor.startsWith(item.lada));

  if (!pais) {
    return {
      lada: '+52',
      numero: valor.replace(/^\+\d+/, '').trim(),
    };
  }

  return {
    lada: pais.lada,
    numero: valor.slice(pais.lada.length).replace(/\D/g, ''),
  };
}

function Bandera({ iso, className = '' })  {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      alt={iso}
      width="24"
      height="18"
      className={`inline-block h-[18px] w-6 rounded-[2px] object-cover ${className}`}
      loading="lazy"
    />
  );
}

export default function DatosCliente({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();

  const telefonoInicial = useMemo(
    () => separarTelefono(reserva.clienteTelefono),
    [reserva.clienteTelefono]
  );

  const [nombre, setNombre] = useState(reserva.clienteNombre || '');
  const [email, setEmail] = useState(reserva.clienteEmail || '');
  const [lada, setLada] = useState(telefonoInicial.lada);

  const [paisIso, setPaisIso] = useState(
    PAISES.find(p => p.lada === telefonoInicial.lada)?.iso || 'MX'
  );

  const [telefono, setTelefono] = useState(telefonoInicial.numero);

  const [observaciones, setObservaciones] = useState(
    reserva.observaciones || ''
  );

  const [codigoDescuento, setCodigoDescuento] = useState(
    reserva.clienteCodigoDescuento || ''
  );

  const [error, setError] = useState('');
  const [abrirPaises, setAbrirPaises] = useState(false);

  const paisSeleccionado =
    PAISES.find(p => p.iso === paisIso) || PAISES[0];

  const seleccionarPais = (pais) => {
    setPaisIso(pais.iso);
    setLada(pais.lada);
    setAbrirPaises(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const numeroLimpio = telefono.replace(/\D/g, '');

    if (!nombre.trim() || !email.trim() || !numeroLimpio) {
      setError('Completa nombre, correo y teléfono para continuar.');
      return;
    }

    if (numeroLimpio.length < 7 || numeroLimpio.length > 15) {
      setError(
        'Verifica el número telefónico. Debe contener entre 7 y 15 dígitos.'
      );
      return;
    }

    dispatch({
      type: 'SET_CLIENTE',
      payload: {
        clienteNombre: nombre.trim(),
        clienteEmail: email.trim(),
        clienteTelefono: `${lada}${numeroLimpio}`,
        observaciones: observaciones.trim(),
        clienteCodigoDescuento: codigoDescuento.trim().toUpperCase(),
      },
    });

    if (typeof onNext === 'function') onNext();
  };

  const ETIQUETA =
    'mb-1.5 flex items-center gap-2 text-xs font-semibold text-white/80';

  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
      >
        {/* NOMBRE COMPLETO */}
        <div>
          <label className={ETIQUETA}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/75" aria-hidden="true">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z" />
            </svg>
            Nombre completo
          </label>

          <input
            className={CAMPO_OSCURO}
            type="text"
            autoComplete="name"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Juan Pérez García"
            required
          />
        </div>

        {/* CORREO */}
        <div>
          <label className={ETIQUETA}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/75" aria-hidden="true">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
            </svg>
            Correo electrónico
          </label>

          <input
            className={CAMPO_OSCURO}
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />

          <p className="mt-1.5 text-[10px] text-white/45">
            Aquí recibirás tu confirmación y hoja de servicio.
          </p>
        </div>

        {/* TELEFONO */}
        <div>
          <label className={ETIQUETA}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/75" aria-hidden="true">
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.56 3.57.56.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.56 3.57a1 1 0 0 1-.25 1.02l-2.19 2.2Z" />
            </svg>
            Teléfono
          </label>

          <div className="relative flex h-[43px] w-full items-stretch rounded-lg border border-white/30 bg-white/[0.07] transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/35 focus-within:shadow-[0_0_14px_rgba(59,130,246,0.22)]">
            {/* SELECTOR DE BANDERA */}
            <button
              type="button"
              onClick={() => setAbrirPaises(!abrirPaises)}
              aria-label="Seleccionar país"
              aria-expanded={abrirPaises}
              className="flex w-[48px] shrink-0 items-center justify-center gap-1 border-r border-white/25 bg-white/[0.035] hover:bg-white/[0.10]"
            >
              <Bandera iso={paisSeleccionado.iso} />

              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="text-white/65">
                <path d="m5 7 5 5 5-5H5Z" />
              </svg>
            </button>

            {/* MENU DE PAISES */}
            {abrirPaises && (
              <div className="absolute left-0 top-[46px] z-50 max-h-64 w-[270px] overflow-y-auto rounded-lg border border-white/15 bg-[#171719] shadow-2xl">
                {PAISES.map(pais => (
                  <button
                    key={pais.iso}
                    type="button"
                    onClick={() => seleccionarPais(pais)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs text-white transition hover:bg-white/10 ${
                      paisIso === pais.iso ? 'bg-white/10' : ''
                    }`}
                  >
                    <Bandera iso={pais.iso} />
                    <span className="flex-1">{pais.nombre}</span>
                    <span className="text-white/50">{pais.lada}</span>
                  </button>
                ))}
              </div>
            )}

            {/* LADA */}
            <div className="flex w-[55px] shrink-0 items-center justify-center border-r border-white/25 text-sm font-medium text-white">
              {lada}
            </div>

            {/* NUMERO TELEFONICO */}
            <input
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={telefono}
              onChange={e => setTelefono(e.target.value.replace(/[^\d\s()-]/g, ''))}
              placeholder={paisSeleccionado.ejemplo}
              required
            />
          </div>

          <p className="mt-1.5 text-[10px] text-white/45">
            Tus datos están protegidos con encriptación SSL. Nunca los compartiremos.
          </p>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className={ETIQUETA}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/75" aria-hidden="true">
              <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v2h12V7H6Zm0 4v2h12v-2H6Zm0 4v2h8v-2H6Z" />
            </svg>
            Observaciones (opcional)
          </label>

          <textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="📝 Ej. Mi vuelo llega a las 10:30, llevo equipaje especial..."
            className={`${CAMPO_OSCURO} min-h-[90px] resize-y leading-relaxed`}
          />
          <p className="mt-2 text-[11px] leading-relaxed text-white/60">
            📍 Si necesita que su regreso sea en otra ubicación, anótelo aquí.
          </p>
        </div>


        {/* CODIGO DE DESCUENTO */}
        <div>
          <input
            type="text"
            value={codigoDescuento}
            onChange={e => setCodigoDescuento(e.target.value.toUpperCase())}
            placeholder="Código"
            autoComplete="off"
            className="w-full rounded-lg border border-white/30 bg-white/[0.07] px-3 py-2.5 text-xs text-white/90 placeholder:text-white/45 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-blue-500/35 focus:shadow-[0_0_14px_rgba(59,130,246,0.22)]"
          />
        </div>

        {/* AVISO */}
        <p className="text-[11px] leading-relaxed text-white/50">
          <span className="mr-1 text-emerald-500">🔒</span>
          Al continuar, confirmas que los datos proporcionados son correctos y aceptas el aviso de privacidad.
        </p>

        {/* ERROR */}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
          >
            {error}
          </p>
        )}

        {/* BOTONES */}
        <div className="flex gap-3 pt-1">
          {/* ATRÁS — AMARILLO SOLO AL PASAR EL CURSOR */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-lg border border-white/15 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/75 transition-all duration-300 hover:bg-[#E5A000] hover:text-black hover:border-[#F5B800] hover:shadow-[0_0_12px_rgba(229,160,0,0.30)] hover:-translate-y-[1px] active:scale-[0.97]"
            >
              ← Atrás
            </button>
          )}

          {/* CONTINUAR AL PAGO */}
          <button
            type="submit"
            className="flex-1 rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-gray-200 active:scale-[0.98]"
          >
            Continuar al pago →
          </button>
        </div>
      </form>
    </div>
  );
}
