/** A rectangle shape. */
export class Rectangle {

  constructor(
    public readonly width: number,
    public readonly height: number
  ) {}

}

/** A shape that can be attached to a collider to give it its physical form. */
export type Shape = Rectangle;

/** Collider config. */
export interface ColliderData {
  /**
   * Density of the collider measured in kilograms per square meter. A higher density
   * means a heavier collider and therefore a heavier rigid body. For example a
   * rectangular collider with a size 2x2m and a density of `80` will have a total weight
   * of 160kg.
   */
  density: number;
  /**
   * Value between `0` and `1` that determines how much friction the collider has when
   * sliding on others. A value of `0` completely disables friction.
   */
  friction: number;
  /**
   * Flags the collider to be a sensor. Sensors will detect collisions but won't produce
   * any responses and can only collide when one of the colliding bodies is dynamic. E.g.
   * when attached to a kinematic body a sensor won't detect collisions on collision with
   * a static or another kinematic body.
   */
  sensor: boolean;
}

/**
 * Colliders are the shapes of rigid bodies that are actually colliding (e.g. the body
 * parts) with each other.
 */
export class Collider implements ColliderData {

  /** @inheritDoc */
  public density = 0;

  /** @inheritDoc */
  public friction = 0;

  /** @inheritDoc */
  public sensor = false;

  constructor(public shape: Shape) {}

}


