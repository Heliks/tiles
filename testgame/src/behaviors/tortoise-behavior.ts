import { Behavior, MonoBehavior } from '../behavior';
import { Entity, Transform, World, Vec2 } from '@heliks/tiles-engine';
import { rand } from '@heliks/tiles-engine';
import { Movement } from '../movement-system';

function getRandomPointInCircle(minRadius: number, maxRadius: number): Vec2 {
  const r = rand(minRadius, maxRadius);
  const t = rand(1, 360);

  console.log(r, t)

  return {
    x: Math.sqrt(r) * Math.cos(t),
    y: Math.sqrt(r) * Math.sin(t)
  };
}


/**
 *
 */
export class TortoiseBehavior implements MonoBehavior {

  public update(entity: Entity, behavior: Behavior, world: World) {
    const transform = world.storage(Transform).get(entity);
    const movement = world.storage(Movement).get(entity);

    if (!movement.target) {
      const position = getRandomPointInCircle(1, 5);

      position.x += transform.world.x;
      position.y += transform.world.y;

      movement.target = position;

      console.log('FROM:', transform.world.x, transform.world.y);
      console.log('TO:  ', position.x, position.y);
    }




    // console.log(transform.world);

  }

}
