import { createClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "./supabase";

export const BANNER_ADMIN_EMAIL = "contacto@transportesmx.org";

export function getBannerToken(req) {
  const cookies = String(req.headers.cookie || "").split(";");

  for (const item of cookies) {
    const cookie = item.trim();
    const prefix = "tmx_banner_session=";

    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }

  return "";
}

export async function validarSesionBanner(req) {
  const token = getBannerToken(req);
  if (!token) return false;

  const supabase = getServiceSupabase();
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) return false;

    return (
      String(data.user.email || "").trim().toLowerCase() ===
      BANNER_ADMIN_EMAIL
    );
  } catch {
    return false;
  }
}

export async function autenticarBanner(email, password) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Falta la configuración pública de Supabase.");
  }

  const correo = String(email || "").trim().toLowerCase();

  if (correo !== BANNER_ADMIN_EMAIL || !password) {
    return null;
  }

  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email: correo,
    password,
  });

  if (
    error ||
    !data?.session?.access_token ||
    String(data.user?.email || "").trim().toLowerCase() !==
      BANNER_ADMIN_EMAIL
  ) {
    return null;
  }

  return {
    token: data.session.access_token,
    expiresIn: data.session.expires_in || 3600,
  };
}
