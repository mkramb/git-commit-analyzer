# git-commit-analyzer

> Lets have a conversation with our GIT history.

## Setup

### Local setup

Install pnpm:

```
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

Compile & start commands:

```
pnpm run build
pnpm run start
```

### Provisioning dependencies

Qdrant - vector database:

```
docker compose up
docker compose down
rm -fr ./qdrant_data
```

### Serve LLM locally

```
ollama run llama3.2
ollama ps
```

## Usage

### Importing a new repository

```
DEBUG=app:* pnpm run import --repositoryPath ../platform/
```

### Executing a query

# make sure server is start

# via, pnpm run start

```
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Who made the most commits after 5h pm BST?"}' \
| jq -r '.content'
```

```
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Provide a summary of most popular changes."}' \
| jq -r '.content'
```

```
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Give me the latest commit from every author."}' \
| jq -r '.content'
```
