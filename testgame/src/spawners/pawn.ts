import { Handle } from '@heliks/tiles-assets';
import { Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { NodeHandle, SpriteAnimation, SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Direction } from '../components/direction';
import { CollisionGroups } from '../const';
import { Pawn } from '../pawn/pawn-controller';
import { Rectangle } from '@heliks/tiles-math';

export function spawnPawn(world: World, spritesheet: Handle<SpriteSheet>, x: number, y: number, node?: NodeHandle): void {
  const body = RigidBody.dynamic()
    .attach(new Rectangle(0.4, 0.4, 0, 0.1), {
      density: 120
    });
    // .attach(new Rectangle(1.5, 1.5), {
    //   sensor: true,
    // });

  body.damping = 10;
  body.group = CollisionGroups.Player;

  // Insert player character.
  world
    .builder()
    // .use(new Camera(200, 200))
    .use(new Transform(x, y))
    .use(new SpriteDisplay(spritesheet, 1, node))
    .use(new SpriteAnimation([]))
    .use(new Pawn())
    .use(new Direction())
    .use(body)
    .build();
}
