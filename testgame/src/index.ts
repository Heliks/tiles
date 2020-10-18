import 'reflect-metadata';
import { AssetLoader, AssetsModule, Handle } from '@heliks/tiles-assets';
import { Entity, Game, GameBuilder, TransformSystem, World } from '@heliks/tiles-engine';
import { PhysicsDebugDraw, PhysicsModule } from '@heliks/tiles-physics';
import { PixiModule, Renderer, SPRITE_SHEET_STORAGE, SpriteSheet } from '@heliks/tiles-pixi';
import { TilemapModule } from '@heliks/tiles-tilemap';
import { GameMapHandler, TmxModule, TmxTilemapFormat } from '@heliks/tiles-tmx';
import { InputHandler } from './input';
import { PawnController, spawnPawn } from './pawn';
import { ArrowSystem } from './arrow';
import { DeathBundle, DebugDeathReporter } from './death';
import { lookupEntity } from './utils';
import { AsepriteFormat } from '@heliks/tiles-aseprite';

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
    .async('spritesheets/pawn-test.json', new AsepriteFormat(), storage);

  const sheet = storage.get(handle)?.data;

  if (!sheet) {
    throw new Error('Unexpected Error');
  }

  return handle;
}

async function fetchMap(world: World, file: string) {
  return world.get(AssetLoader).fetch(file, new TmxTilemapFormat());
}

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
    .module(
      new PixiModule({
        antiAlias: false,
        autoResize: true,
        background: 0x45283c,
        resolution: [320, 180],
        unitSize: UNIT_SIZE
      })
        .plugin(PhysicsDebugDraw)
        // .plugin(DrawGridSystem)
    )
    .system(ArrowSystem)
    .module(new DeathBundle())
    .system(DebugDeathReporter)
    .module(new TilemapModule())
    .module(new TmxModule())
    .system(PawnController)
    .build();

  setupDebugGlobals(game);

  // Configure asset directory and add renderer to DOM.
  game.world.get(AssetLoader).setBaseUrl('assets');
  game.world.get(Renderer).appendTo(getDomTarget());

  // Initial player position.
  const x = 25;
  const y = 25;

  const mapFile = 'maps/test.json';

  initPawn(game.world).then(pawnSpriteSheet => {
    // Start the ticker.
    game.start();

    const mapHandler = game.world.get(GameMapHandler);

    // spawnMap
    fetchMap(game.world, mapFile).then(mapData => {
      const map = mapHandler.spawn(game.world, mapData);

      // Get the layer where our pawn is allowed to be spawned
      // Todo: Handle maps that don't have a single pawn layer
      // Todo: Currently only one player floor is allowed.
      const layer = map.getPawnLayers()[0];

      // Spawn player character.
      spawnPawn(game.world, pawnSpriteSheet, x, y, layer.node);

      // Spawn Josh in a random location near the player
      // spawnJosh(
      //   game.world,
      //   loadSpriteSheet(game.world, 'spritesheets/josh.png', 1, 1),
      //   x + rand(-3, 3),
      //   y + rand(-3, 3)
      // );
    });
  });
};




