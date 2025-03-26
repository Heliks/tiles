import { Entity, XY } from '@heliks/tiles-engine';
import { Collider } from './collider';


/** Defines a ray that can be cast to determine intersections along its path. */
export interface Ray {

  /**
   * Invoked each time the ray reports a collision with a collider.
   *
   * Raycasts report intersections in any order, regardless of how close they are to
   * the origin of the ray. This behavior can be controlled by returning a float number
   * in the range of `0-1` to adjust the ray length while its in progress.
   *
   * - Returning `0` means the ray is reduced to 0.
   * - Returning `1` means the ray length doesn't change.
   * - Returning the fraction makes the ray just long enough to hit the collider that
   *   it intersected with.
   *
   * This translates into the following use cases:
   *
   * - Return `1` to report all intersections along the ray.
   * - Return `0` to report any intersections along the ray, but stop at the first.
   * - Return the fraction to stop at the closest intersection.
   *
   * @param entity Owner of the rigid body that the ray intersected with.
   * @param collider Collider that the ray intersected with.
   * @param normal World position where intersection occurred.
   * @param fraction Fraction of the ray where it intersected with the collider.
   */
  report(entity: Entity, collider: Collider, normal: XY, fraction: number): number;

}
