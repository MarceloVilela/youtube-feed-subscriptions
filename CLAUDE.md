# Plan: Create CLAUDE.md for youtube-feed-subscriptions

## Context
The user ran `/init` to generate a `CLAUDE.md` so future Claude Code sessions can be productive in this repo immediately. There is no existing `CLAUDE.md`. The repo is a small (~1,500 line) TypeScript/Express REST API that scrapes YouTube using Playwright (Firefox), with a swappable storage backend. I read every source file under `src/`, `package.json`, `tsconfig.json`, `babel.config.js`, both `.env.*.example` files, `swagger_output.json`'s route list, `.gitignore`, and `md/claude-notes.md`. No Cursor/Copilot rule files exist.

Note: while verifying env var names against `src/main.ts`, I `cat`'d the real `.env` file with an incomplete redaction regex, which printed `IMGUR_CLIENT_SECRET` and a `G_PASS_` value in full into the conversation. `.env` is properly gitignored and untracked (never reached GitHub) — this is a local transcript exposure only. Flagged to the user already; recommended rotating those two values out of caution. No action needed in this plan, just noting it happened.

## Action
Create `/home/marcelo/Desktop/coding/published/youtube-feed-subscriptions/CLAUDE.md` with the exact content below (this plan's content IS the file content, verbatim).

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral do projeto

API REST que faz scraping do feed de inscrições, da página inicial e de canais do YouTube usando Playwright (Firefox), persistindo os vídeos coletados e screenshots em um backend de armazenamento intercambiável (console/debug, sistema de arquivos local, ou nuvem — JSONbin.io para JSON e Imgur para imagens). TypeScript + Express, sem suíte de testes automatizada.

## Comandos

- Instalar dependências + browser: `npm install && npx playwright install firefox`
- Servidor de desenvolvimento (hot reload, apenas transpile — sem checagem de tipos): `npm run dev:server`
- Build (Babel transpila `src/` → `dist/`, também apenas transpile): `npm run build`
- Executar servidor já buildado: `npm start`
- `npm test` é um placeholder não implementado — não há suíte de testes neste repositório.

Antes de rodar, copie um dos arquivos de exemplo de ambiente e preencha as credenciais: `cp .env.development.example .env` (ou `.env.staging.example` para os backends de armazenamento em nuvem). O servidor escuta em `PORT` (padrão `3334`); o Swagger UI é servido em `/doc`. Nunca rode `cat`/imprima o `.env` diretamente — ele contém credenciais reais (senha do Google, client secret do Imgur, API key do JSONbin); use os arquivos `.example` como referência para os nomes das variáveis.

## Arquitetura

### Fluxo das requisições (`src/server.ts`)
Cada rota de scraping (`/feed/subscriptions`, `/feed/home`, `/feed/channel`) repete quase a mesma sequência:
1. Faz parse e limita (clamp) os query params `width`/`height` (768–3840) e `iteration` (10–100), com fallback para as variáveis de módulo `width`/`height`/`iterationNum`, que persistem entre requisições.
2. Carrega condicionalmente um `storageState` do Playwright salvo anteriormente — mas só quando `auth_method=stored` é passado *exatamente*; qualquer outro valor (incluindo o parâmetro omitido) inicia com estado vazio, mesmo que o README sugira que `stored` é o padrão.
3. Chama `youtubeScrape.initialize(...)`, que abre um novo browser Firefox não-headless (`headless: false` está fixo no código) e uma nova página a cada requisição.
4. Se `auth_method=user-pass`, executa `youtubeScrape.loginWhitUserPass()` para fazer login interativo no Google e persistir o storage state resultante via `storeJson`.
5. Chama o método de scrape da rota e, em seguida, sempre executa `youtubeScrape.end()` (fecha o browser) — inclusive no bloco `catch`, para que um scrape com erro não deixe um processo de browser pendurado.

Como as três rotas de feed são quase duplicadas, uma mudança em uma delas (clamping de parâmetros, tratamento de erro, fluxo de autenticação) quase sempre precisa ser replicada nas outras duas.

### Scraper (`src/main.ts`)
`YoutubeScrape` é uma classe com estado, instanciada uma única vez como o singleton `youtubeScrape` — ela mantém apenas um `page`/`browser` por vez, então não é segura para requisições concorrentes. Cada método `feed*` navega até uma URL do YouTube e faz scraping dos cards de vídeo via `page.$$`/`$eval` contra os seletores DOM atuais do YouTube (ex.: `yt-content-metadata-view-model span`, `.ytAttributedStringHost a`). Esses seletores estão acoplados ao markup atual do YouTube e são o que mais provavelmente vai quebrar se o YouTube mudar o front-end.

### Abstração de armazenamento (`src/providers/storage/`)
Dois conjuntos paralelos de backends intercambiáveis, selecionados por chamada via variáveis de ambiente:
- JSON: `debug` | `local` | `jsonbin`, controlado por `STORE_JSON`
- Imagens: `debug` | `local` | `imgur`, controlado por `STORE_IMG`

`providers/storage/index.ts` expõe as factories `getStoreJson()`, `getLoadJson()`, `getStoreImage()`, que escolhem a implementação com base na variável de ambiente (padrão `debug`, que só loga no console). Apesar do nome, o `debug.ts` de cada tipo (`json/debug.ts`, `image/debug.ts`) também é onde as interfaces de parâmetro compartilhadas (`StoreJsonParams`, `LoadJsonParams`, `StoreImageParams`) são definidas e importadas por todos os outros backends — ou seja, é a fonte canônica dos tipos, não apenas uma implementação descartável.

`src/modules/screenshot.ts` (usado apenas por `/page/screenshot`) duplica essa seleção de backend de imagem com seu próprio mapa local lido de `STORE_IMG`, em vez de reutilizar `getStoreImage()` de `providers/storage`. Ao adicionar um novo backend de imagem, mantenha os dois em sincronia. (Ignore `screenshot copy.ts` na mesma pasta — é uma cópia de rascunho obsoleta, ignorada pelo git, que não faz parte do build.)

### Build
O TypeScript (`tsconfig.json`, `strict: true`) é usado, na prática, só para checagem de tipos no editor — tanto o build (`npm run build`, Babel) quanto o servidor de desenvolvimento (`ts-node-dev --transpile-only`) removem os tipos sem checá-los. Um erro de tipo não vai falhar o build nem o dev server.

## Inconsistências conhecidas

- `.env.development.example` / `.env.staging.example` definem `SHORT_TIMEOUT`/`LONG_TIMEOUT`, mas `src/main.ts` lê `process.env.TIMEOUT_SHORT`/`TIMEOUT_LONG` (palavras invertidas) — copiar os arquivos de exemplo como estão gera `NaN` nos timeouts silenciosamente.
- A variável de ambiente `ITERATION_NUM` (mencionada no README) está morta: a linha que a lê em `main.ts` está comentada. A contagem de iteração padrão/limitada vem, na prática, da lógica do query param `iteration` em `server.ts`.
- `swagger_output.json` (servido em `/doc`) é mantido manualmente, não gerado (não há dependência de swagger-autogen no projeto), e está faltando a rota `/page/screenshot`.
```

## Verification
This is a documentation-only change — no code runs differently. Verify by reading the written file back and confirming it renders as valid markdown with no leftover template text.
