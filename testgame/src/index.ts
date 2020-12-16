import 'reflect-metadata';
import { AssetLoader, AssetsModule, Handle } from '@heliks/tiles-assets';
import { Entity, Game, GameBuilder, rand, TransformSystem, World } from '@heliks/tiles-engine';
import { Physics, PhysicsDebugDraw, PhysicsModule } from '@heliks/tiles-physics';
import { PixiModule, Renderer, SPRITE_SHEET_STORAGE, SpriteSheet } from '@heliks/tiles-pixi';
import { TilemapModule } from '@heliks/tiles-tilemap';
import { GameMapHandler, TmxModule, TmxTilemapFormat } from '@heliks/tiles-tmx';
import { InputHandler } from './input';
import { PawnController, spawnPawn } from './pawn';
import { ArrowSystem } from './arrow';
import { DeathBundle, DebugDeathReporter } from './death';
import { loadSpriteSheet, lookupEntity } from './utils';
import { AsepriteFormat } from '@heliks/tiles-aseprite';
import { spawnJosh } from './spawners/josh';
import { CombatSystem } from './combat';
import { MATERIAL_ORGANIC, MATERIAL_WOOD, MaterialType } from './const';
import { BehaviorManager, BehaviorModule } from './behavior';
import { TortoiseBehavior } from './behaviors/tortoise-behavior';
import { MovementSystem } from './movement-system';

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
    .system(TransformSystem)
    .system(InputHandler)
    .module(new AssetsModule('assets'))
    .module(new PhysicsModule({ unitSize: UNIT_SIZE }))
    .module(
      new PixiModule({
        antiAlias: false,
        autoResize: true,
        background: 0x45283c,
        resolution: [320, 180],
        unitSize: UNIT_SIZE
      })
        // .plugin(PhysicsDebugDraw)
        // .plugin(DrawGridSystem)
    )
    .system(ArrowSystem)
    .module(new DeathBundle())
    .system(DebugDeathReporter)
    .module(new TilemapModule())
    .module(new TmxModule())
    .system(CombatSystem)
    .system(PawnController)
    .module(new BehaviorModule())
    .system(MovementSystem)
    .build();

  setupDebugGlobals(game);

  // Configure asset directory and add renderer to DOM.
  game.world.get(Renderer).appendTo(getDomTarget());

  // Initial player position.
  const x = 10;
  const y = 10;

  const mapFile = 'maps/test.json';

  // Register entity behaviors.
  game.world
    .get(BehaviorManager)
    .set('tortoise', new TortoiseBehavior());

  // Register physics materials.
  game.world.get(Physics)
    .setMaterial(MaterialType.ORGANIC, MATERIAL_ORGANIC)
    .setMaterial(MaterialType.WOOD, MATERIAL_WOOD);

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
      spawnPawn(game.world, pawnSpriteSheet, x, y, layer.entity);

      // Spawn Josh in a random location near the player
      spawnJosh(
        game.world,
        loadSpriteSheet(game.world, 'spritesheets/josh.png', 1, 1),
        x + rand(-2, 2),
        y + rand(-2, 2),
        layer.entity
      );
    });
  });
};




