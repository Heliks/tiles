just a 2d game engine playground

Everything is WIP

```bash
$ yarn install
```

# Build

Requirements:
- Node 14

### Build all packages

```bash
$ yarn build
```

### Watch for file changes 

Note: All packages need to be build via `yarn:build` once before file watchers 
can be used because they are not sorted according to the dependency graph.

```bash
$ yarn build:watch
```

# Testing

Before running unit tests make sure the project was build at least once.

```bash
yarn test
```
