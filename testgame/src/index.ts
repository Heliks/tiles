import { AssetLoader, AssetsModule, Handle } from '@heliks/tiles-assets';
import { Entity, Game, GameBuilder, rand, World } from '@heliks/tiles-engine';
import { TransformSystem } from '@heliks/tiles-engine';
import { PhysicsModule } from '@heliks/tiles-physics';
import { PhysicsDebugDraw } from '@heliks/tiles-physics';
import { PixiModule, Renderer, SPRITE_SHEET_STORAGE, SpriteSheet, SpriteSheetFormat } from '@heliks/tiles-pixi';
import { TilemapModule } from '@heliks/tiles-tilemap';
import { TmxTilemapFormat } from '@heliks/tiles-tmx';
import 'reflect-metadata';
import { InputHandler } from './input';
import { PawnController } from './pawn/pawn-controller';
import { spawnJosh } from './spawners/josh';
import { spawnPawn } from './spawners/pawn';
import { ArrowSystem } from './systems/arrow';
import { DeathSystem } from './systems/death';
import { DrawGridSystem } from './systems/draw-grid-system';
import { loadSpriteSheet, lookupEntity } from './utils';

// Meter to pixel ratio.
export const UNIT_SIZE = 16;

/** Sets up some global functions for debugging. */
function setupDebugGlobals(game: Game): void {
  const _w = window as any;

  // The game instance itself.
  _w.GAME = game;

  // Utility to look up entities.
  _w.LOOKUP_ENTITY = (entity: Entity) => lookupEntity(game.world, entity);
}

/** @internal */
async function initPawn(world: World): Promise<Handle<SpriteSheet>> {
  const storage = world.get(SPRITE_SHEET_STORAGE);

  // Load the sprite sheet.
  const handle = await world
    .get(AssetLoader)
    .async('spritesheets/pawn.json', new SpriteSheetFormat(), storage);

  const sheet = storage.get(handle);

  if (!sheet) {
    throw new Error('Unexpected Error');
  }

  return handle;
}

async function fetchMap(world: World, file: string) {
  return world.get(AssetLoader).fetch(file, new TmxTilemapFormat());
}

/** @internal */
/*
async function spawnMap(world: World, file: string): Promise<void> {
  const map = await fetchMap(world, file);

  for (let i = 0, l = map.layers.length; i < l; i++) {
    const layer = map.layers[i];

    switch (layer.constructor) {
      case TileLayer:
        for (const { id, index } of layer.iter()) {
          // Grids are top left aligned. Convert to center aligned world position.
          const position = map.grid.toCenter(map.grid.pos(index));
          const tileset  = map.tileset(id);

          world
            .builder()
            .use(new Transform(position[0] / 16, position[1] / 16))
            .use(new SpriteDisplay(
              tileset.spritesheet,
              // Convert global tile id to a local sprite index.
              tileset.toLocal(id) - 1,
              i
            ))
            .build();
        }
      break;
    }
  }
}*/

/** @internal */
function getDomTarget(): HTMLElement {
  const domTarget = document.getElementById('stage');

  if (!domTarget) {
    throw new Error('Could not find stage.');
  }

  return domTarget;
}

window.onload = () => {
  const game = new GameBuilder()
    .system(InputHandler)
    .system(TransformSystem)
    .module(new AssetsModule())
    .module(new PhysicsModule({ unitSize: UNIT_SIZE }))
    .system(PawnController)
    .module(
      new PixiModule({
        antiAlias: false,
        autoResize: true,
        background: 0x45283c,
        resolution: [320, 180],
        unitSize: UNIT_SIZE
      })
        .plugin(PhysicsDebugDraw)
        .plugin(DrawGridSystem)
    )
    .system(ArrowSystem)
    .system(DeathSystem)
    .module(new TilemapModule())
    .build();

  setupDebugGlobals(game);

  // Configure asset directory and add renderer to DOM.
  game.world.get(AssetLoader).setBaseUrl('assets');
  game.world.get(Renderer).appendTo(getDomTarget());

  // Initial player position.
  const x = 5;
  const y = 5;

  const map = 'tilemaps/test01.json';

  initPawn(game.world).then(pawnSpriteSheet => {
    // Start the ticker.
    game.start();

    // Spawn player character.
    spawnPawn(game.world, pawnSpriteSheet, x, y);

    // Spawn Josh in a random location near the player
    spawnJosh(
      game.world,
      loadSpriteSheet(game.world, 'spritesheets/josh.png', 1, 1),
      x + rand(-3, 3),
      y + rand(-3, 3)
    );

    // spawnMap
  });
};




