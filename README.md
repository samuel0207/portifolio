# Estúdio Atlas — Portfólio Editável, Agenda & Inventário

Aplicação web responsiva em **React + TypeScript + Tailwind CSS** com portfólio público editável, sistema de agendamentos em tema escuro refinado e inventário de produtos com controle de estoque, protegido por autenticação administrativa e pronto para **Vercel + Supabase**.

## Como executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Rotas Principais

- `/` ou `/p/:slug` — Portfólio público com projetos/serviços, calendário de agendamentos e vitrine de produtos.
- `/admin/login` — Login administrativo (com modo de demonstração e preenchimento automático).
- `/admin` — Painel protegido com Visão Geral, Portfólio & Perfil, Agenda & Eventos, Inventário e Configurações/Backup.

## Credenciais de Demonstração

Editáveis em `src/config/auth.ts` ou via variáveis de ambiente:

- **Usuário:** `admin@estudioatlas.com.br`
- **Senha:** `atlas2026`

## Deploy na Vercel

1. Importe este repositório na [Vercel](https://vercel.com/new).
2. O arquivo `vercel.json` já está configurado com rewrite SPA (`/(.*) -> /index.html`) para todas as rotas (`/p/:slug`, `/admin/*`).
3. Em **Settings → Environment Variables**, adicione:
   - `VITE_ADMIN_USER` — E-mail/usuário do administrador
   - `VITE_ADMIN_PASS` — Senha do administrador
   - `VITE_SUPABASE_URL` — URL do seu projeto Supabase (opcional; sem ela funciona em LocalStorage)
   - `VITE_SUPABASE_ANON_KEY` — Chave pública `anon` do Supabase

## Conexão com Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Abra o **SQL Editor**, cole e execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. Copie a **Project URL** e a **anon public key** em **Settings → API** e adicione nas variáveis de ambiente da Vercel (ou no seu `.env` local).
4. Na primeira abertura, a aplicação sincronizará automaticamente os dados iniciais com a tabela `portfolio_state` e habilitará sincronização em tempo real (Realtime) entre o Admin e o Link Público.
