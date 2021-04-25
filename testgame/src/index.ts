import 'reflect-metadata';
import { AssetLoader, AssetsModule, Handle } from '@heliks/tiles-assets';
import { Entity, Game, GameBuilder, TransformModule, World } from '@heliks/tiles-engine';
import { Physics, PhysicsDebugDraw, PhysicsModule } from '@heliks/tiles-physics';
import { PixiModule, Renderer, SPRITE_SHEET_STORAGE, SpriteSheet } from '@heliks/tiles-pixi';
import { TilemapModule } from '@heliks/tiles-tilemap';
import { InputHandler } from './input';
import { PawnController, spawnPawn } from './pawn';
import { ArrowSystem } from './arrow';
import { DeathBundle, DebugDeathReporter } from './death';
import { lookupEntity } from './utils';
import { AsepriteFormat } from '@heliks/tiles-aseprite';
import { CombatSystem } from './combat';
import { MATERIAL_ORGANIC, MATERIAL_WOOD, MaterialType } from './const';
import { BehaviorManager, BehaviorModule } from './behavior';
import { TortoiseBehavior } from './behaviors/tortoise-behavior';
import { MovementSystem } from './movement-system';
import { DrawGridSystem } from './systems/draw-grid-system';
import { TmxTilemapFormat } from '@heliks/tiles-tmx';
import { MapHierarchy, MapManager, ParseWorld, WorldModule } from './world';
import { SpawnerObject } from './world-objects/spawner-object';
import { SpawnerManager, SpawnerModule } from './world-objects';
import { TortoiseBlueprint } from './spawners/tortoise-blueprint';

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
    .module(new TransformModule())
    .module(new AssetsModule('assets'))
    .module(new PhysicsModule({
      unitSize: UNIT_SIZE
    }))
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
    .system(CombatSystem)
    .module(new WorldModule())
    .module(new SpawnerModule())
    .system(PawnController)
    .module(new BehaviorModule())
    .system(MovementSystem)
    .build();

  setupDebugGlobals(game);

  game.world.get(Renderer).appendTo(getDomTarget());

  // Initial player position.
  const x = -0;
  const y = -0;

  // Register entity behaviors.
  game.world
    .get(BehaviorManager)
    .set('tortoise', new TortoiseBehavior());

  // Register physics materials.
  game.world.get(Physics)
    .setMaterial(MaterialType.ORGANIC, MATERIAL_ORGANIC)
    .setMaterial(MaterialType.WOOD, MATERIAL_WOOD);

  game.world.get(SpawnerManager)
    .register('CRITTER_TORTOISE', new TortoiseBlueprint())

  // Start the game loop.
  game.start();

  initPawn(game.world).then(pawnSpriteSheet => {
    game.world
      .get(AssetLoader)
      .fetch('maps/world-test/testworld', new ParseWorld(UNIT_SIZE))
      .then(world => {
        const hierarchy = game.world.get(MapHierarchy);

        // Set the loaded map as active. The map manager will automatically load
        // individual world chunks on demand.
        game.world.get(MapManager).setWorld(world);

        spawnPawn(game.world, pawnSpriteSheet, x, y, hierarchy.layer2);
    });



    // fetchMap(game.world, mapFile).then(mapData => {
    //   game.world.get(GameMapHandler).spawn(game.world, mapData, 0, 0);

    // spawnPawn(game.world, pawnSpriteSheet, 0, 0/*, floor.layer2*/);
    // });

    //const mapHandler = game.world.get(GameMapHandler);

    //fetchMap(game.world, mapFile).then(mapData => {
      // Spawn the map.
      //mapHandler.spawn(game.world, mapData);

      // Get floor where we can spawn our entities.
      // const floor = mapHandler.getFloor(0);

      // Spawn player character.
      //spawnPawn(game.world, pawnSpriteSheet, x, y/*, floor.layer2*/);


      // Spawn Josh in a random location near the player
      // spawnJosh(
      //   game.world,
      // AsepriteFormat.load(game.world, 'spritesheets/josh.json'),
      // x + rand(-5, 5),
      // y + rand(-5, 5),
      // floor.layer2
      // );
    // });
  });

};




