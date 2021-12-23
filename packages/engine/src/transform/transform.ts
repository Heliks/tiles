import { Transform as BaseTransform } from '@heliks/ecs-transform';
import { Vec2 } from '@heliks/tiles-math';


/**
 * Simple transform component that adds a position and a rotation to an entity.
 *
 * @see BaseTransform
 */
export class Transform extends BaseTransform {

  /** @inheritDoc */
  public readonly local = new Vec2();

  /** @inheritDoc */
  public readonly world = new Vec2();

}