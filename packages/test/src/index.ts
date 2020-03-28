import 'reflect-metadata';
import { AssetLoader, AssetsModule } from '@tiles/assets';
import { GameBuilder, Transform, World } from '@tiles/engine';
import { Camera, PixiModule, Renderer, SpriteAnimation, SpriteDisplay, SpriteSheet, TextureFormat } from '@tiles/pixi';
import { Pawn, PlayerController } from './player-controller';
import { BodyPartType, DebugDraw, DebugDrawFlag, PhysicsModule, RigidBody, RigidBodyType } from "@tiles/physics";
import { InputHandler } from "./input";

// Meter to pixel ratio.
export const UNIT_SIZE = 16;

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
      antiAlias: false,
      unitSize: UNIT_SIZE
    }))
    .module(new PhysicsModule({
      debugDraw: true,
      unitSize: UNIT_SIZE
    }))
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

  const sheet = new SpriteSheet(image, 20, 1, 16, 28)
    .setAnimation('walk-down', {
      frames: [2, 3, 4, 5, 6, 7]
    })
    .setAnimation('walk-up', {
      frames: [8, 9, 10, 11, 12, 13]
    })
    .setAnimation('walk-right', {
      frames: [14, 15, 16, 17, 18, 19]
    });

  // Add sprite-sheet to player.
  game.world.storage(SpriteDisplay).set(player, new SpriteDisplay(sheet, 1));
  game.world.storage(SpriteAnimation).set(player, new SpriteAnimation([]));

  const body = new RigidBody(RigidBodyType.Dynamic).attach({
    data: [0.5, 0.75],
    density: 120,
    type: BodyPartType.Rect
  });

  body.damping = 5;

  game.world.storage(RigidBody).set(player, body);

  // Insert player into the world.
  game.world.insert(player);

  // Start the ticker.
  game.start();
};


