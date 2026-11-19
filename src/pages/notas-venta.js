<div className="mt-2 inline-block max-w-full bg-green-600 px-3 py-1 text-[16px] font-extrabold text-white">
            Total: {moneda(datos.importe)}
          </div>

          <div className="mt-2 h-[3mm]" aria-hidden="true" />

          <div className="bg-black px-2 py-1.5 text-[16px] font-extrabold text-white">
            Descripción del traslado:
          </div>

          <div className="mt-5 min-w-0 space-y-1.5 break-words text-[13px] sm:mt-[9mm] sm:text-[16px]">

            {[
              ["🚐", "Vehículo:", datos.unidad],
              ["👤", "Nombre del cliente:", datos.cliente],
              ["📅", "Fecha y hora:", valorFechaHora(datos)],
              ["📍", "Recoger en:", datos.origen],
              ["✈️", "Aerolínea:", datos.aerolinea || "N/A"],
              ["👥", "Número de pasajeros:", datos.pasajeros],
              ["🧳", "Número de maletas:", datos.maletas],
              ["☎️", "Número de teléfono:", datos.telefono],
              ["📍", "Destino:", datos.destino],
              ["🔄", "Tipo de viaje:", datos.idaVuelta === "redondo" ? "Ida y vuelta" : datos.idaVuelta === "sencillo" ? "Sencillo" : ""],
              ["⏱️", "Duración:", datos.duracion],
            ].map(([icono, etiqueta, valor]) => (
              <p
                key={etiqueta}
                className="flex flex-wrap items-start gap-x-1"
              >
                <span>{icono}</span>
                <strong>{etiqueta}</strong>
                <span className="break-words">{valor || ""}</span>
              </p>
            ))}

          </div>

          <div className="mt-6 flex min-w-0 flex-wrap items-start gap-1 break-words text-[13px] sm:mt-[15mm] sm:text-[16px]">

            <span>↩️</span>

            <strong>Regreso:</strong>

            <span>{valorRegreso(datos)}</span>

          </div>

          <div className="mt-4 min-h-16 min-w-0 break-words rounded-[20px] border-2 border-black px-3 py-3 text-[13px] sm:mt-5 sm:rounded-[24px] sm:px-4 sm:text-[14px]">

            <strong className="mb-1 block">
              Observaciones:
            </strong>

            <span>{datos.observaciones || ""}</span>

          </div>

          <footer className="mt-3 border-t-2 border-black pt-3 text-center text-[10px] leading-4 text-slate-600 sm:mt-4 sm:text-[11px]">

            <p>
              San Miguel de Allende, Guanajuato · Documento Generado:{" "}
              {fechaActual.fecha} · Hora: {fechaActual.hora}
            </p>

            <p>
              Grupo Turístico MX S. de R.L. de C.V.
            </p>

          </footer>

        </article>}


        {(!mostrarPreviewNota || !mostrarPreviewBanner) && <div className="mb-3 flex flex-wrap gap-2">
          {!mostrarPreviewNota && <button type="button" onClick={() => setMostrarPreviewNota(true)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white">Mostrar Nota de Venta</button>}
          {!mostrarPreviewBanner && <button type="button" onClick={() => setMostrarPreviewBanner(true)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white">Mostrar Banner</button>}
        </div>}

        {mostrarPreviewBanner && <div className="mx-auto mt-4 w-full max-w-[760px] overflow-hidden rounded-xl border border-slate-400 bg-white text-black shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-3">
            <h3 className="font-bold text-slate-800">Vista previa · Banner del cliente</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => accionesPdf("imprimirBanner")} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white">Imprimir</button>
              <button type="button" onClick={() => accionesPdf("compartirBanner")} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">Compartir</button>
              <button type="button" onClick={() => setMostrarPreviewBanner(false)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Cancelar</button>
            </div>
          </div>
          <div className="mx-auto flex aspect-[215.9/139.7] w-full flex-col items-center justify-center gap-3 overflow-hidden bg-white p-5 sm:p-8">
            <img src="/logo.jpg" alt="Transportes MX" className="h-[35%] max-w-[45%] object-contain" />
            <div className="flex h-[55%] w-full items-center justify-center overflow-hidden whitespace-nowrap text-center text-2xl font-black italic uppercase leading-none sm:text-5xl" style={{fontSize: `clamp(18px, 6vw, 72px)`}}>{datos.cliente || "NOMBRE DEL CLIENTE"}</div>
          </div>
        </div>}
        </div>

        <p className="mx-auto mt-3 max-w-[760px] text-sm text-slate-600">
          La vista previa sigue la distribución del documento impreso.
          Para generar el PDF, pulsa “Imprimir / PDF”.
        </p>

      </section>

    </div>

  </div>
</main>
  );
}
