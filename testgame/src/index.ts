import 'reflect-metadata';
import { AssetLoader, AssetsModule, Handle } from '@heliks/tiles-assets';
import { Entity, Game, GameBuilder, rand, World } from '@heliks/tiles-engine';
import { PixiModule, Renderer, SPRITE_SHEET_STORAGE, SpriteSheet, SpriteSheetFromTexture } from '@heliks/tiles-pixi';
import { PlayerController } from './player-controller';
import { PhysicsDebugDraw, PhysicsModule } from '@heliks/tiles-physics';
import { InputHandler } from './input';
import { ArrowSystem } from './systems/arrow';
import { DeathSystem } from './systems/death';
import { TilemapManager, TilemapModule } from '@heliks/tiles-tilemap';
import { loadSpriteSheet, lookupEntity } from './utils';
import { spawnJosh } from './spawners/josh';
import { TmxTilemapFormat } from '@heliks/tiles-tmx';
import { spawnPawn } from './spawners/pawn';

// Meter to pixel ratio.
export const UNIT_SIZE = 16;

/*
function spawnCrate(
  world: World,
  sheet: Handle<SpriteSheet>,
  x: number,
  y: number,
  health = 25,
  type = RigidBodyType.Static
): void {
  const body = new RigidBody(type).attach({
    data: [0.75, 0.875],
    density: 20,
    type: BodyPartType.Rect
  });

  body.damping = 5;
  body.group = CollisionGroups.Terrain;

  world.builder()
    .use(body)
    .use(new Transform(x, y))
    .use(new Health(health, health))
    .use(new SpriteDisplay(sheet, 0, 1))
    .build();
}
 */



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
  const handle = await world.get(AssetLoader).async(
    'spritesheets/pawn.png', new SpriteSheetFromTexture(27, 1, 32, 32), storage
  );

  const sheet = storage.get(handle);

  if (!sheet) {
    throw new Error('Unexpected Error');
  }

  // Manually set animation data.
  sheet.data
    .setAnimation('idle-down', { frames: [0] })
    .setAnimation('idle-up', { frames: [1] })
    .setAnimation('idle-right', { frames: [2] })
    .setAnimation('walk-down', { frames: [3, 4, 5, 6, 7, 8] })
    .setAnimation('walk-up', { frames: [9, 10, 11, 12, 13, 14] })
    .setAnimation('walk-right', { frames: [15, 16, 17, 18, 19, 20] })
    .setAnimation('bow-right', { frames: [21, 22, 23, 24, 25, 26] });

  return handle;
}

/** @internal */
async function loadMap(world: World, file: string): Promise<void> {
  const manager = world.get(TilemapManager);
  const handle = await world.get(AssetLoader).async(
    file,
    new TmxTilemapFormat(),
    manager.cache
  );

  const asset = manager.cache.get(handle);

  if (asset) {
    manager.spawn(world, asset.data);
  }
  else {
    throw new Error('Failed to load map');
  }
}

window.onload = () => {
  const domTarget = document.getElementById('stage');

  if (!domTarget) {
    throw new Error();
  }

  const game = new GameBuilder()
    .system(InputHandler)
    .module(new AssetsModule())
    .module(new PhysicsModule({ unitSize: UNIT_SIZE }))
    .system(PlayerController)
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
    .system(DeathSystem)
    .module(new TilemapModule())
    .build();

  setupDebugGlobals(game);

  // Configure asset directory and add renderer to DOM.
  game.world.get(AssetLoader).setBaseUrl('assets');
  game.world.get(Renderer).appendTo(domTarget);

  // Initial player position.
  const x = 25;
  const y = 25;

  const map = 'tilemaps/test01.json';

  initPawn(game.world).then(pawnSpriteSheet => {
    // Start the ticker.
    game.start();

    // Spawn Josh in a random location near the player
    spawnJosh(
      game.world,
      loadSpriteSheet(game.world, 'spritesheets/josh.png', 1, 1),
      x + rand(-3, 3),
      y + rand(-3, 3)
    );

    // Init map.
    loadMap(game.world, map).then(() => {
      // Spawn player character.
      spawnPawn(game.world, pawnSpriteSheet, x, y);
    });
  });
};




