just a 2d game engine playground

Everything is WIP

```bash
$ pnpm install
```

# Setup

## Requirements:

- Node 14
- pnpm

Install dependencies via `pnpm`.

```$bash
$ pnpm install
```


# Build

```bash
$ pnpm build
```

### Watch for file changes 

Note: When packages are build in watch mode, they are not sorted according to
their dependency graph. All packages must be build via `pnpm build` once.

```bash
$ pnpm build:watch
```

# Testing

Before running unit tests make sure the project was build at least once.

```bash
pnpm test
```
