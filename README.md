# YouTube Feed Subscriptions

API REST para scraping do feed de inscrições e home do YouTube utilizando Playwright (Firefox). Permite extrair dados de vídeos (título, URL, canal, thumbnail, visualizações, data de publicação) e armazená-los em JSONbin.io, arquivos locais ou console. Também oferece captura de screenshots com upload para Imgur.

## Funcionalidades

- **GET `/feed/subscriptions`** — Scrape do feed de inscrições (`youtube.com/feed/subscriptions`)
- **GET `/feed/home`** — Scrape da página inicial do YouTube (`youtube.com`)
- **GET `/feed/channel?url=<url>`** — Scrape dos vídeos de um canal específico
- **GET `/page/screenshot?url=<url>&y=<posicoes>`** — Screenshot de qualquer página em uma ou mais posições de scroll (ver seção [Screenshots](#screenshots))
- **GET `/doc`** — Documentação Swagger UI
- **GET `/`** — Informações da API e rotas disponíveis

## Tecnologias

- Node.js + TypeScript
- Express.js
- Playwright (Firefox)
- Babel (transpilação)
- Swagger UI Express
- JSONbin.io (armazenamento JSON em nuvem)
- Imgur (armazenamento de imagens em nuvem)

## Requisitos

- Node.js 14+
- Playwright com Firefox: `npx playwright install firefox`

## Instalação

```bash
npm install
npx playwright install firefox
```

## Configuração

Copie o arquivo de ambiente e preencha as variáveis:

```bash
cp .env.development.example .env
```

### Principais variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | `3334` |
| `ITERATION_NUM` | Máx. de vídeos por requisição | `10` |
| `G_USER` | Email Google para login | — |
| `G_PASS` | Senha Google | — |
| `STORE_JSON` | Backend JSON: `debug`, `local` ou `jsonbin` | `jsonbin` |
| `STORE_IMG` | Backend imagem: `debug`, `local` ou `imgur` | `imgur` |
| `JSONBIN_API_KEY` | Chave da API JSONbin.io | — |
| `IMGUR_CLIENT_ID` | Client ID do Imgur | — |

## Uso

### Desenvolvimento (com hot-reload)

```bash
npm run dev:server
```

### Produção

```bash
npm run build
npm start
```

## Autenticação no YouTube

A API suporta dois métodos via query param `auth_method`:

- **`stored`** (padrão) — Usa estado de navegação salvo anteriormente (cookies/localStorage)
- **`user-pass`** — Faz login completo com `G_USER`/`G_PASS` e salva o estado para requisições futuras

## Parâmetros Comuns

Todas as rotas de scraping aceitam:

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `auth_method` | `stored` / `user-pass` | `stored` | Método de autenticação |
| `width` | number (768–3840) | `1200` | Largura do viewport |
| `height` | number (768–3840) | `1000` | Altura do viewport |
| `iteration` | number (10–100) | `10` | Máx. de vídeos a extrair |

## Screenshots

A rota `GET /page/screenshot` abre a URL informada em um browser Firefox headless (viewport `1152x950`, tema escuro), rola até cada posição Y informada e captura uma screenshot em cada uma — útil para gerar imagens de páginas longas em múltiplos pontos sem precisar automatizar o scroll manualmente.

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `url` | string | URL da página a capturar |
| `y` | number[] (separados por vírgula) | Posições de scroll vertical (em pixels) onde cada screenshot é tirada |

Exemplo:

```
GET /page/screenshot?url=https://exemplo.com&y=0,800,1600
```

Retorna um array com uma entrada por posição `y`, na mesma ordem em que foram informadas. Cada screenshot é persistida pelo backend de imagem configurado em `STORE_IMG` (`imgur`, `local` ou `debug` — ver [Principais variáveis de ambiente](#principais-variáveis-de-ambiente)); com `imgur`, a resposta traz a URL pública da imagem enviada.

## Estrutura do Projeto

```
├── src/
│   ├── server.ts            # Servidor Express e rotas
│   ├── main.ts              # Lógica de scraping com Playwright
│   ├── modules/
│   │   └── screenshot.ts    # Utilitário de screenshot
│   └── providers/storage/   # Backends de armazenamento
│       ├── json/            # debug, local, jsonbin
│       └── image/           # debug, local, imgur
├── tmp/                     # Armazenamento local (JSON e screenshots)
├── .env                     # Variáveis de ambiente
└── swagger_output.json      # Especificação OpenAPI
```

## Licença

ISC
