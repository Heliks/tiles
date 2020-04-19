import 'reflect-metadata';
import { AssetLoader, AssetsModule } from '@tiles/assets';
import { GameBuilder, Transform, World } from '@tiles/engine';
import { Camera, PixiModule, Renderer, SpriteAnimation, SpriteDisplay, SpriteSheet, TextureFormat } from '@tiles/pixi';
import { Pawn, PlayerController } from './player-controller';
import { BodyPartType, DebugDraw, DebugDrawFlag, PhysicsModule, RigidBody, RigidBodyType } from "@tiles/physics";
import { InputHandler } from "./input";
import { DrawGridSystem } from "./systems/draw-grid-system";
import { CollisionGroups } from "./const";
import { ArrowSystem } from "./systems/arrow";
import { Health } from "./components/health";
import { DeathSystem } from "./systems/death";

// Meter to pixel ratio.
export const UNIT_SIZE = 16;

function spawnTerrain(world: World, x: number, y: number) {
  const body = new RigidBody().attach({
    data: [1, 1],
    density: 120,
    type: BodyPartType.Rect
  });

  body.damping = 5;
  body.group = CollisionGroups.Terrain;

  world.builder()
    .use(body)
    .use(new Transform(x, y))
    .use(new Health(25, 25))
    .build();
}

function getSpriteSheet(world: World) {
  const image = world.get(AssetLoader).load(
    'spritesheets/pawn.png',
    new TextureFormat(),
    world.get(Renderer).textures
  );

  return new SpriteSheet(image, 26, 1, 32, 32)
    .setAnimation('walk-down', {
      frames: [2, 3, 4, 5, 6, 7]
    })
    .setAnimation('walk-up', {
      frames: [8, 9, 10, 11, 12, 13]
    })
    .setAnimation('walk-right', {
      frames: [14, 15, 16, 17, 18, 19]
    })
    .setAnimation('bow-right', {
      frames: [20, 21, 22, 23, 24, 25]
    });
}

window.onload = () => {
  const domTarget = document.getElementById('stage');

  if (!domTarget) {
    throw new Error();
  }

  const game = new GameBuilder()
    .system(InputHandler)
    .module(new AssetsModule())
    .module(new PixiModule({
      antiAlias: false,
      unitSize: UNIT_SIZE
    }))
    .module(new PhysicsModule({
      debugDraw: true,
      unitSize: UNIT_SIZE
    }))
    .system(DrawGridSystem)
    .system(PlayerController)
    .system(ArrowSystem)
    .system(DeathSystem)
    .build();

  // Configure asset directory
  const loader = game.world.get(AssetLoader).setBaseUrl('assets');

  // Configure renderer
  const renderer = game.world
    .get(Renderer)
    .setBackgroundColor(0x45283c)
    .appendTo(domTarget)
    .setAutoResize(true)
    .setResolution(320, 180);

  game.world.get(DebugDraw).setDrawFlags(
    DebugDrawFlag.Shapes,
    DebugDrawFlag.Joints
  );

  // Initialize rigid body.
  const body = new RigidBody(RigidBodyType.Dynamic).attach({
    data: [0.4, 0.4],
    density: 120,
    type: BodyPartType.Rect
  });

  body.damping = 5;
  body.group = CollisionGroups.Player;

  // Insert player character.
  game.world
    .builder()
    .use(new Camera(200, 200))
    .use(new Transform(2, 2))
    .use(new SpriteDisplay(getSpriteSheet(game.world), 1))
    .use(new SpriteAnimation([]))
    .use(new Pawn())
    .use(body)
    .build();

  // Start the ticker.
  game.start();

  // Spawn some terrain for debugging purposes.
  spawnTerrain(game.world, 14, 2);
  spawnTerrain(game.world, 14, 3);
  spawnTerrain(game.world, 14, 4);

  console.log(game);
};


