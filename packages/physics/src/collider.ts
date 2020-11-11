import { Circle, Rectangle } from '@heliks/tiles-math';
import { MaterialData, MaterialId } from './material';

/** A shape that can be attached to a collider to give it its physical form. */
export type Shape = Circle | Rectangle;

/** Collider config. */
export interface ColliderData {
  /**
   * The id of the material or `MaterialData` that should be used for the physical
   * properties of this collider. If not set a default material will be used.
   */
  material?: MaterialData | MaterialId;
  /**
   * If set to `true` the collider will act as a sensor. Sensors will detect collisions
   * but won't produce any responses and can only collide when one of the colliding
   * bodies is dynamic. E.g. when attached to a kinematic body a sensor won't detect
   * collisions with a static or another kinematic body.
   */
  sensor: boolean;
}

/**
 * Colliders are the shapes of rigid bodies that are actually colliding (e.g. the body
 * parts) with each other.
 */
export class Collider implements ColliderData {

  /** @inheritDoc */
  public material?: MaterialData | MaterialId;

  /** @inheritDoc */
  public sensor = false;

  /**
   * @param shape The colliders physical shape.
   */
  constructor(public shape: Shape) {}

}


