import { Entity, Vec2, XY } from '@heliks/tiles-engine';
import { Collider, Ray } from '@heliks/tiles-physics';


/**
 * Ray to find the closest obstacle for the {@link Avoidance} behavior.
 *
 * The ray must be manually reset to before reuse, otherwise the result from the next
 * cast will be checked against the result of the previous one as well. This allows the
 * ray to be cast multiple times to find the closest obstacle found in any of these casts.
 */
export class AvoidanceRay implements Ray {

  /** Last known normal of closest obstacle.*/
  public normal = new Vec2();

  /** The closest obstacle that has been reported by that ray, if any. */
  public obstacle?: Entity;

  /** Last known closest friction. */
  private fraction = Infinity;

  /** @inheritDoc */
  public report(entity: Entity, collider: Collider, normal: XY, fraction: number): number {
    if (fraction < this.fraction) {
      this.obstacle = entity;
      this.fraction = fraction;
      this.normal.copy(normal);
    }

    return fraction;
  }

  /** Resets the ray result. */
  public reset(): void {
    this.obstacle = undefined;
    this.fraction = Infinity;
  }

}
