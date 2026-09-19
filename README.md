# Control Personal

Aplicación personal en Next.js + Supabase para finanzas, alimentación, peso, running y gimnasio.

## 1. Supabase
Abre SQL Editor en tu proyecto de Supabase, pega todo `supabase/schema.sql` y ejecútalo una sola vez.

## 2. Autenticación
En Supabase > Authentication puedes dejar Email habilitado. La pantalla `/login` permite crear la cuenta personal e iniciar sesión. Para uso personal, después de crear tu cuenta puedes desactivar nuevos registros en Supabase si lo deseas.

## 3. Vercel
Variables de producción:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable key `sb_publishable_...`)

Después de cualquier cambio en variables, haz Redeploy.

## 4. GitHub
Sube todos estos archivos al repositorio. Vercel desplegará automáticamente si el repositorio está conectado.

## Estado
Esta versión ya elimina las pantallas placeholder y permite registros reales de peso, alimentos/comidas, running, gimnasio, cuentas y movimientos financieros. Incluye RLS por usuario.
