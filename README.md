 # Webhook Debugger (Simplificado)

 Projeto para receber, listar e debugar webhooks — monorepo com API e frontend.

 ## O que há de novo / notas importantes

 - Seed com 60+ webhooks de exemplo gerados por `@faker-js/faker` (simula eventos Stripe).
 - O seed sincroniza o `id` da linha (`webhooks.id`) com `body.id` do evento usando `uuidv7()`.
 - O seed distribui `createdAt` em datas variadas (hoje, 1–6 dias atrás, 8–14 dias, 15–60 dias) para testar paginação temporal.
 - A API usa `createdAt` como cursor de paginação (cursor = ISO string); isso evita duplicações no infinite scroll.
 - Rota frontend `/webhooks` (index) foi adicionada — exibe "No webhook selected"; detalhe em `/webhooks/:id`.

 ## Tecnologias

 - Node.js
 - TypeScript
 - Vite + React (web)
 - Fastify (API)
 - Drizzle ORM (Postgres) — migrações e seed
 - pnpm (recomendado; npm também suportado)

 ## Requisitos

 - Node.js (versão compatível com o projeto)
 - pnpm (recomendado) ou npm
 - Docker (opcional, se desejar rodar o banco via docker-compose)

 ## Instalação (rápida)

 Execute no diretório raiz do repositório (pnpm):

 ```bash
 pnpm install
 ```

 Usando npm (alternativa):

 ```bash
 npm install
 ```

 Isso instalará dependências para o workspace. Se preferir, instale separadamente em cada pacote (`api` e `web`).

 ## Banco de dados

 O projeto inclui `api/docker-compose.yml` para iniciar um Postgres em dev. Exemplo:

 ```bash
 cd api
 docker-compose up -d
 ```

 Configure `DATABASE_URL` em `api/.env` se preferir apontar para outro banco.

 ## Seed (populando dados de exemplo)

 Há um seed que insere 60+ registros simulando eventos do Stripe. Ele usa `@faker-js/faker` e `uuidv7`.

 Para rodar o seed:

 ```bash
 cd api
 # instalar dependências no pacote api (caso ainda não tenha rodado)
 pnpm install
 # ou npm install

 # rodar seed
 pnpm run db:seed
 # ou
 npm run db:seed
 ```

 Observações:
 - O seed é aditivo (insere novos registros a cada execução). Se quiser idempotência, posso alterar o script para limpar registros de seed antes de inserir.
 - Cada registro tem `createdAt` variado e `body.created` sincronizado (epoch seconds), o que facilita testar paginação e ordenação.

 ## Execução em desenvolvimento

 API:

 ```bash
 cd api
 pnpm install # se necessário (ou npm install)
 pnpm dev
 # npm equivalente por pacote:
 # npm run dev
 ```

 Frontend (web):

 ```bash
 cd web
 pnpm install # se necessário (ou npm install)
 pnpm dev
 # npm equivalente por pacote:
 # npm run dev
 ```

 Alternativas a partir da raiz do workspace:

 ```bash
 # com pnpm
 pnpm --filter api dev
 pnpm --filter web dev

 # com npm (workspaces)
 npm install
 npm --workspace=api run dev
 npm --workspace=web run dev
 ```

 Observação: portas e variáveis de ambiente estão em `api/src/env.ts` e `api/src/server.ts` — ajuste conforme necessário.

 ## Endpoints principais

 - POST /capture/*  — recebe webhooks externos e os persiste (rota `src/routes/capture-webhook.ts`).
 - GET /api/webhooks  — lista webhooks com paginação por cursor (cursor = ISO string de `createdAt`).
 - GET /api/webhooks/:id — obtém detalhes de um webhook específico.

## Geração de handlers (Gemini / Generative AI)

O projeto inclui uma rota para gerar um handler TypeScript automático a partir de exemplos de webhooks armazenados.

- Endpoint: POST /api/generate
- Body: `{ "webhookIds": ["<id1>", "<id2>"] }`
- Response: `{ "code": "<typescript code>" }` — o código retornado é o handler TypeScript gerado.

Esse endpoint usa o modelo Gemini (via SDK `@ai-sdk/google`) e requer uma API key válida do Google Generative AI (Gemini).

Como obter e configurar a chave:

1. No Google Cloud Console, habilite a API Generative AI / Gemini e crie uma chave de API.
2. No arquivo `api/.env` (ou nas variáveis de ambiente do seu ambiente), configure:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

3. Reinicie a API para que a variável seja lida (`pnpm dev` / `npm run dev`).

Observações:
- A chave dá acesso ao modelo e pode incorrer em custos conforme o uso — monitore suas quotas e faturamento.
- O endpoint aceita vários `webhookIds` e irá concatenar os corpos armazenados para enviar como prompt ao modelo; o retorno é apenas o código TypeScript (sem explicações).
- Se preferir suportar outro provedor de LLMs, posso adicionar fallback/variantes de providers e um modo de configuração.

 ## Frontend (rotas)

 - `/webhooks` — index (exibe "No webhook selected" quando nenhum item está selecionado).
 - `/webhooks/:id` — detalhe do webhook selecionado.

 O frontend usa React Query (infinite query) para paginação e carregamento incremental.

 ## Observações técnicas

 - `webhooks.id` é `text` com valor default `uuidv7()` no schema; o seed agora configura explicitamente `id` (uuidv7) para sincronizar com `body.id` quando desejado.
 - A paginação do endpoint de listagem compara `createdAt < cursorDate` e ordena por `createdAt DESC` para evitar duplicações no infinite scroll.
 - Se muitos itens tiverem o mesmo `createdAt`, uma melhoria é usar um cursor composto (`createdAt` + `id`) para ordenação determinística.

 ## Estrutura (resumida)

 - `/api` — backend (TypeScript, Fastify, Drizzle, seed, migrações)
 - `/web` — frontend (React + Vite, routes, components)

 ## Contribuição

 Pull requests são bem-vindos. Abra uma issue ou PR com descrição curta do que será implementado.

 ## Licença

 Arquivo de licença não incluído neste README; adicione uma licença se for publicar este repositório.

 ---

 README atualizado com notas sobre seed, cursor e rotas. Ajuste comandos/portas conforme o seu ambiente.
