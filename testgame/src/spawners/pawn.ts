import { Transform, World } from '@heliks/tiles-engine';
import { Handle } from '@heliks/tiles-assets';
import { BodyPartType, RigidBody, RigidBodyType } from '@heliks/tiles-physics';
import { CollisionGroups } from '../const';
import { SpriteAnimation, SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Pawn } from '../player-controller';

export function spawnPawn(world: World, spritesheet: Handle<SpriteSheet>, x: number, y: number): void {
  // Initialize rigid body.
  const body = new RigidBody(RigidBodyType.Dynamic).attach({
    data: [0.4, 0.4],
    density: 120,
    type: BodyPartType.Rect
  });

  body.damping = 10;
  body.group = CollisionGroups.Player;

  const pawnTransform = new Transform(x, x);

  // Insert player character.
  world
    .builder()
    // .use(new Camera(200, 200))
    .use(pawnTransform)
    .use(new SpriteDisplay(spritesheet, 1, 1))
    .use(new SpriteAnimation([]))
    .use(new Pawn())
    .use(body)
    .build();
}
