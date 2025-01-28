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
```

## Usage

### Importing a new repository

```
pnpm run import --repositoryName "unique-name" --repositoryPath "local-path"
```
