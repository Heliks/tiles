import { Handle } from '@heliks/tiles-assets';
import { Transform, World } from '@heliks/tiles-engine';
import { Rectangle, RigidBody } from '@heliks/tiles-physics';
import { SpriteAnimation, SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Direction } from '../components/direction';
import { CollisionGroups } from '../const';
import { Pawn } from '../pawn/pawn-controller';

export function spawnPawn(world: World, spritesheet: Handle<SpriteSheet>, x: number, y: number): void {
  const body = RigidBody.dynamic()
    .attach(new Rectangle(0.4, 0.4), {
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
    .use(new Transform(x, x))
    .use(new SpriteDisplay(spritesheet, 1, 1))
    .use(new SpriteAnimation([]))
    .use(new Pawn())
    .use(new Direction())
    .use(body)
    .build();
}
