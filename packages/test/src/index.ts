import 'reflect-metadata';
import { AssetLoader, AssetsModule } from '@tiles/assets';
import { GameBuilder, Transform } from '@tiles/engine';
import { Camera, PixiModule, Renderer, SpriteAnimation, SpriteDisplay, SpriteSheet, TextureFormat } from '@tiles/pixi';
import { InputHandler, Pawn, PlayerController } from './player-controller';

window.onload = () => {
  const domTarget = document.getElementById('stage');

  if (!domTarget) {
    throw new Error();
  }

  const game = new GameBuilder()
    .system(InputHandler)
    .system(PlayerController)
    .module(new AssetsModule())
    .module(new PixiModule({
      antiAlias: false
    }))
    .build();

  // Configure asset directory
  const loader = game.world.get(AssetLoader).setBaseUrl('assets');

  // Configure renderer
  const renderer = game.world
    .get(Renderer)
    .setBackgroundColor(0x000000)
    .appendTo(domTarget)
    .resizeToParent()
    .setAutoResize(true)
    .setResolution(320, 180);

  const player = game.world
    .builder()
    .use(new Camera(200, 200))
    .use(new Transform(2, 2))
    .use(new Pawn())
    .build();

  const image = loader.load(
    'spritesheets/pawn.png',
    new TextureFormat(),
    renderer.textures
  );

  const sheet = new SpriteSheet(image, 19, 1, 16, 28);

  // Add sprite-sheet to player.
  game.world.storage(SpriteDisplay).set(player, new SpriteDisplay(sheet, 1));
  game.world.storage(SpriteAnimation).set(player, new SpriteAnimation([ 1, 2, 3, 4, 5, 6 ]));

  // Insert player into the world.
  game.world.insert(player);

  // Start the ticker.
  game.start();
};

