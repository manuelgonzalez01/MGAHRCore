# MGAHRCore

Frontend enterprise de gestion de recursos humanos construido con React, Vite y Supabase.

MGAHRCore centraliza:
- administracion y estructura organizacional
- employees y ciclo del colaborador
- recruitment
- vacations
- development
- insurance
- personnel actions
- occupational health
- reports
- self-service

## Estado del proyecto

El proyecto queda preparado para:
- versionado en GitHub
- despliegue en Vercel
- autenticacion real con Supabase
- operacion multiempresa con aislamiento por tenant en los modulos ya conectados

## Stack

- React 19
- Vite 8
- React Router
- Zustand
- Supabase

## Requisitos

- Node.js `>=20.19.0`
- npm `>=10`

## Variables de entorno

Crea un archivo `.env` local a partir de `.env.example`.

```env
VITE_APP_NAME=MGAHRCore
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=/api
VITE_USE_MOCKS=false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Notas:
- `VITE_SUPABASE_ANON_KEY` es publica y apta para frontend.
- No uses `service_role` en el cliente.
- `.env` esta ignorado por git y no debe subirse al repositorio.

## Desarrollo local

```bash
npm install
npm run dev
```

## Validacion de release

```bash
npm run lint
npm run build
npm run check:release
```

## Despliegue en Vercel

1. Importa el proyecto desde GitHub.
2. Framework preset: `Vite`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```bash
dist
```

5. Configura estas variables en Vercel:
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_API_BASE_URL`
- `VITE_USE_MOCKS`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

La configuracion SPA para refresco de rutas queda soportada por `vercel.json`.

## Supabase

La app usa:
- autenticacion de usuarios con Supabase Auth
- `profiles` enlazado a `auth.users`
- aislamiento multiempresa por `company_id` y RLS

Antes de usar entornos reales valida:
- usuario `super_admin` o tenant admin existente en `auth.users`
- fila correspondiente en `public.profiles`
- variables de entorno configuradas en local y en Vercel

## Estructura relevante

- `src/app`: shell, layouts, router y providers
- `src/modules`: dominios funcionales
- `src/services/supabase`: cliente, contexto tenant y repositorio Supabase
- `supabase/migrations`: SQL de estructura y aislamiento multiempresa
- `supabase/verification`: verificaciones operativas

## Seguridad de repositorio

El repositorio queda preparado para no subir:
- `.env`
- `dist`
- `.vercel`
- credenciales privadas

## Observaciones actuales

- `Administration` y `Employees` ya operan sobre Supabase con aislamiento tenant.
- `Recruitment` ya usa Supabase para `job_requests` y `candidates`.
- Hay modulos que todavia conservan parte del fallback local mientras se completa la migracion de persistencia.
