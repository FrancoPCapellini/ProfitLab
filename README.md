# ProfitLab — Modelo Financiero SaaS

Herramienta de forecast interno para ProfitLab.

## Cómo deployar en Vercel (gratis, 5 minutos)

### Opción A: Sin Git (la más rápida)

1. Abrí https://vercel.com/new
2. Elegí "Import Project" → "Browse" → subí esta carpeta
3. Vercel detecta Vite automáticamente
4. Click "Deploy" → tu URL en 2 minutos

### Opción B: Con GitHub (recomendado para actualizaciones)

1. Creá un repo en GitHub (privado)
2. `git init && git add . && git commit -m "Initial"`
3. `git remote add origin <tu-repo> && git push`
4. Conectá el repo en vercel.com
5. Cada `git push` redeploya automáticamente

## Cómo deployar en Netlify (alternativa)

1. Instalá Netlify CLI: `npm install -g netlify-cli`
2. `npm install && npm run build`
3. `netlify deploy --prod --dir=dist`

## Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:5173
```

## Usuarios

Cada socio/usuario crea su cuenta en la app (email + contraseña).
Los datos de cada usuario están aislados por Row Level Security en Supabase.

## Stack

- React 18 + Vite
- Tailwind CSS
- Recharts (gráficos)
- Supabase (auth + base de datos PostgreSQL)
- lucide-react (iconos)
