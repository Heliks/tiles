just a 2d game engine playground

```bash
$ yarn install
```

Build all packages with (required before testgame can be started):

```bash
$ yarn build
```

Build the complete engine and watch for file changes: 
Note: This also starts the testgame.

```bash
$ yarn build:watch
```

Start testgame in browser (localhost:9000): 

```bash
$ yarn workspace @heliks/testgame build:watch
```

# Testing

Before running unit tests make sure the project was build at least once.

```bash
yarn test
```
