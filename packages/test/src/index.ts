import 'reflect-metadata';

import { AssetLoader, AssetsModule } from '@tiles/assets';
import { GameBuilder } from '@tiles/engine';
import { Camera, PixiModule, Renderer } from '@tiles/pixi';
import { Transform } from './transform';

window.onload = () => {
  const game = new GameBuilder()
    .module(new AssetsModule())
    .module(new PixiModule({
      antiAlias: false
    }))
    .build();

  // Configure asset directory
  game.world.get(AssetLoader).baseUrl = './';

  // Configure renderer
  game.world
    .get(Renderer)
    .setBackgroundColor(0xFFFF00)
    .appendTo(document.body)
    .resizeToParent()
    .setAutoResize(true);

  const player = game.world
    .builder()
    .use(new Camera(200, 200))
    .use(new Transform(2, 2))
    .build();

  game.world.insert(player);
};

