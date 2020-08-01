import 'reflect-metadata';
import { AssetLoader, AssetsModule, Handle } from '@tiles/assets';
import { Game, GameBuilder, rand, Transform, World } from '@tiles/engine';
import { PixiModule, Renderer, SpriteAnimation, SpriteDisplay, SpriteSheet, SpriteSheetFromTexture } from '@tiles/pixi';
import { Pawn, PlayerController } from './player-controller';
import { BodyPartType, PhysicsDebugDraw, PhysicsModule, RigidBody, RigidBodyType } from '@tiles/physics';
import { InputHandler } from './input';
import { DrawGridSystem } from './systems/draw-grid-system';
import { CollisionGroups } from './const';
import { ArrowSystem } from './systems/arrow';
import { Health } from './components/health';
import { DeathSystem } from './systems/death';
import { TilemapManager, TilemapModule } from '@tiles/tilemap/src';
import { Entity } from '@tiles/entity-system';
import { lookupEntity } from './utils';
import { spawnJosh } from './spawners/josh';
import { SPRITE_SHEET_STORAGE } from '@tiles/pixi';

// Meter to pixel ratio.
export const UNIT_SIZE = 16;

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

function loadSpriteSheet(world: World, path: string, cols: number, rows: number): Handle<SpriteSheet> {
  return world.get(AssetLoader).load(
    path,
    // Todo: Make sprite size configurable.
    new SpriteSheetFromTexture(cols, rows, 16, 16),
    world.get(SPRITE_SHEET_STORAGE)
  );
}

async function getPawnSpriteSheet(world: World) {
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

/** Sets up some global functions for debugging. */
function setupDebugGlobals(game: Game): void {
  const _w = window as any;

  // The game instance itself.
  _w.GAME = game;

  // Utility to look up entities.
  _w.LOOKUP_ENTITY = (entity: Entity) => lookupEntity(game.world, entity);
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

  // Configure asset directory
  game.world.get(AssetLoader).setBaseUrl('assets');

  // Add renderer to DOM.
  game.world.get(Renderer).appendTo(domTarget);

  // Initialize rigid body.
  const body = new RigidBody(RigidBodyType.Dynamic).attach({
    data: [0.4, 0.4],
    density: 120,
    type: BodyPartType.Rect
  });

  body.damping = 10;
  body.group = CollisionGroups.Player;

  getPawnSpriteSheet(game.world).then(pawnSheet => {
    const pawnTransform = new Transform(25, 25);

    // Insert player character.
    game.world
      .builder()
      // .use(new Camera(200, 200))
      .use(pawnTransform)
      .use(new SpriteDisplay(pawnSheet, 1, 1))
      .use(new SpriteAnimation([]))
      .use(new Pawn())
      .use(body)
      .build();

    // Start the ticker.
    game.start();

    // Spawn some terrain for debugging purposes.
    const woodCrateSheet = loadSpriteSheet(game.world, 'spritesheets/wood-crate.png', 1, 1);
    const joshSheet = loadSpriteSheet(game.world, 'spritesheets/josh.png', 1, 1);

    // Spawn the josh in a random location near the player
    spawnJosh(
      game.world,
      joshSheet,
      pawnTransform.x + rand(-3, 3),
      pawnTransform.y + rand(-3, 3)
    );

    spawnCrate(game.world, woodCrateSheet, 14, 2);
    spawnCrate(game.world, woodCrateSheet, 14, 3);
    spawnCrate(game.world, woodCrateSheet, 14, 4);
    spawnCrate(game.world, woodCrateSheet, 0, 0);

    spawnCrate(game.world, woodCrateSheet, 10, 3, 200, RigidBodyType.Dynamic);

    const tilemapMgr = game.world.get(TilemapManager);

    tilemapMgr.async('tilemaps/test01.json').then(handle => {
      tilemapMgr.spawn(game.world, handle);
    });
  });

};


