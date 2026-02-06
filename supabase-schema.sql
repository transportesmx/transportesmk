-- ===========================================
-- TABLA DE RESERVAS - TransportesMX
-- Ejecuta este SQL en Supabase → SQL Editor
-- ===========================================

-- Tabla principal de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Estado
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'confirmada', 'cancelada', 'completada')),

  -- Datos del cliente
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,

  -- Datos del servicio
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  fecha_ida DATE NOT NULL,
  hora_ida TIME NOT NULL,
  tipo_viaje TEXT DEFAULT 'sencillo' CHECK (tipo_viaje IN ('sencillo', 'redondo')),
  fecha_regreso DATE,
  hora_regreso TIME,
  num_pasajeros INTEGER DEFAULT 1,

  -- Ruta
  distancia TEXT,
  distancia_metros INTEGER,
  duracion TEXT,

  -- Vehículo
  vehiculo_id TEXT NOT NULL,
  vehiculo_nombre TEXT NOT NULL,

  -- Precios
  precio_ida DECIMAL(10,2),
  precio_total DECIMAL(10,2) NOT NULL,
  moneda TEXT DEFAULT 'MXN',

  -- Pago
  metodo_pago TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'fallido', 'reembolsado')),

  -- Integraciones
  google_calendar_event_id TEXT,
  pdf_url TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_ida);
CREATE INDEX idx_reservas_email ON reservas(cliente_email);
CREATE INDEX idx_reservas_stripe ON reservas(stripe_session_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Política: permitir insertar desde la API (anon key)
CREATE POLICY "Permitir insertar reservas" ON reservas
  FOR INSERT WITH CHECK (true);

-- Política: permitir leer solo con service key (backend)
CREATE POLICY "Permitir leer reservas con service role" ON reservas
  FOR SELECT USING (auth.role() = 'service_role');

-- Política: permitir actualizar solo con service key (backend/webhook)
CREATE POLICY "Permitir actualizar reservas con service role" ON reservas
  FOR UPDATE USING (auth.role() = 'service_role');
