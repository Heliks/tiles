import { Handle } from '@heliks/tiles-assets';
import { Transform, World } from '@heliks/tiles-engine';
import { RigidBody, RigidBodyType } from '@heliks/tiles-physics';
import { SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Health } from '../components/health';
import { CollisionGroups } from '../const';
import { Rectangle } from '@heliks/tiles-math';

function spawnCrate(
  world: World,
  sheet: Handle<SpriteSheet>,
  x: number,
  y: number,
  health = 25,
  type = RigidBodyType.Static
): void {
  const body = new RigidBody(type)
    .attach(new Rectangle(0.75, 0.75), {
      density: 20
    });

  body.damping = 5;
  body.group = CollisionGroups.Terrain;

  world.builder()
    .use(body)
    .use(new Transform(x, y))
    .use(new Health(health, health))
    .use(new SpriteDisplay(sheet, 0))
    .build();
}
