 # Webhook Debugger (Simplificado)

 Projeto para receber, listar e debugar webhooks - monorepo com API e frontend.

 ## Tecnologias

 - Node.js
 - TypeScript
 - Vite + React (web)
 - Drizzle (DB) e migrações SQL (api)
 - Docker / docker-compose (opcional para banco de dados)
 - pnpm (gerenciador de pacotes usado no workspace)

 ## Requisitos

 - Node.js (versão compatível com o projeto)
 - pnpm (recomendado; pode usar npm/yarn mas os comandos aqui usam pnpm)
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

 ## Banco de dados (opcional)

 Se o projeto usar um banco via Docker, você pode iniciá-lo dentro da pasta `api` com:

 ```bash
 cd api
 docker-compose up -d
 ```

 (Verifique `api/docker-compose.yml` para detalhes.)

 ## Execução em desenvolvimento

API (exemplo):

```bash
cd api
pnpm install # se necessário (ou use npm install)
pnpm dev
# npm equivalente por pacote:
# npm install
# npm run dev
```

Frontend (web):

```bash
cd web
pnpm install # se necessário (ou use npm install)
pnpm dev
# npm equivalente por pacote:
# npm install
# npm run dev
```

Alternativas a partir da raiz do workspace:

Com pnpm (filtrar pacotes):

```bash
pnpm --filter api dev
pnpm --filter web dev
```

Com npm (workspaces):

```bash
npm install
npm --workspace=api run dev
npm --workspace=web run dev
```

Observação: portas e variáveis de ambiente podem estar definidas em `api/src/env.ts` ou em arquivos de configuração; ajuste conforme necessário.

 ## Uso rápido

 - Abra o frontend em `http://localhost:5173` (porta padrão do Vite) — ou verifique o console durante `pnpm dev`.
 - A API geralmente estará em uma porta configurada no projeto (ver `api/src/server.ts` ou variáveis de ambiente). Use o frontend para visualizar webhooks recebidos ou chame a rota de webhooks diretamente via curl/Postman.

 Exemplo de teste simples (envie um POST para o endpoint de webhooks):

 ```bash
 curl -X POST http://localhost:PORT/webhooks -H 'Content-Type: application/json' -d '{"event":"test","data":{}}'
 ```

 Substitua `PORT` pela porta da API.

 ## Estrutura (resumida)

 - `/api` — backend (TypeScript, Drizzle, rotas e migrações)
 - `/web` — frontend (React + Vite)

 ## Contribuição

 Pull requests são bem-vindos. Abra uma issue ou PR com descrição curta do que será implementado.

 ## Licença

 Arquivo de licença não incluído neste README; adicione uma licença se for publicar este repositório.

 ---

 README gerado de forma simplificada — ajuste comandos/portas conforme o seu ambiente/local config.
