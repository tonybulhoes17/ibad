# IBAD — Ficha Anestésica Digital

Sistema web PWA para anestesiologistas — ficha anestésica completa, organograma interativo, PDF A4 e controle financeiro.

---

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + lucide-react + recharts
- **Backend/DB/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel
- **PWA**: next-pwa

---

## Setup Rápido (passo a passo)

### 1. Clone e instale

```bash
git clone <seu-repo>
cd ibad
npm install
```

### 2. Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e cole o conteúdo de `supabase-schema.sql`
3. Execute (F5 ou botão Run)
4. Vá em **Storage** > New Bucket:
   - Nome: `signatures`, Private: **ON**
   - Nome: `logos`, Private: **OFF**
5. Copie sua **URL** e **anon key** em Settings > API

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) > New Project > importe o repo
3. Adicione as variáveis de ambiente (mesmo do .env.local)
4. Deploy!

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/          # login, register, forgot-password
│   ├── (app)/           # páginas protegidas (dashboard, fichas, etc.)
│   ├── print/[id]/      # layout isolado para impressão A4
│   └── onboarding/      # setup inicial
├── components/
│   ├── ficha/           # FichaForm, FichaPrint, Organograma
│   ├── dashboard/       # DashboardClient
│   └── layout/          # AppShell (sidebar + header)
├── hooks/               # useFichas, useProfile, useInstituicoes...
├── lib/                 # supabase clients, utils
├── types/               # database.types.ts
└── constants/           # tipos de anestesia, fluidos, ECG
```

---

## Funcionalidades

- ✅ Auth completa (login, cadastro, recuperação de senha)
- ✅ Onboarding guiado
- ✅ Ficha anestésica em 4 etapas
- ✅ Organograma interativo SVG (O2, gases, sat, ECG, PA/FC, CO2, temp, fluidos)
- ✅ Modelos de texto por tipo de anestesia
- ✅ Geração de PDF / Impressão A4
- ✅ Logo da instituição na ficha impressa
- ✅ Assinatura digital no rodapé
- ✅ Dashboard financeiro completo
- ✅ Filtros avançados na lista de fichas
- ✅ PWA (instalável no celular)
- ✅ RLS — cada médico só vê seus próprios dados

---

## Ícones PWA

Gere os ícones em [realfavicongenerator.net](https://realfavicongenerator.net) e coloque em `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
