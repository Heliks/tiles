import { Circle, Rectangle, UUID, uuid } from '@heliks/tiles-engine';
import { Material } from './material';


/** A shape that can be attached to a collider to give it its physical form. */
export type ColliderShape = Circle | Rectangle;

/** Collider config. */
export interface ColliderData {

  /**
   * Material that is used by this collider. 
   */
  material?: Material;

  /**
   * If set to `true` the collider will act as a sensor. Sensors detect collisions but
   * don't produce a collision response. They can only collide when one of the colliding
   * {@link RigidBody bodies} is {@link RigidBodyType.Dynamic dynamic}. This means that
   * when attached to a {@link RigidBodyType.Kinematic kinematic} body, the sensor will
   * not detect collisions with {@link RigidBodyType.Static} or other kinematic bodies.
   */
  sensor: boolean;

}

/**
 * Colliders are the shapes of rigid bodies that are actually colliding (e.g. the body
 * parts) with each other.
 */
@UUID('c4b05f97-abc9-4efa-b7a8-19413df9a732')
export class Collider<T extends ColliderShape = ColliderShape> implements ColliderData {

  /** Unique identifier. */
  public readonly id = uuid();

  /**
   * Collision group bits. If not set the groups will be inherited from the the rigid
   * body to which the collider was attached to.
   *
   * Do not update this directly. Use `setFilterData()` instead.
   *
   * @see RigidBody.group
   */
  public group?: number;

  /** Indicates that the collider requires an update. */
  public isDirty = false;

  /**
   * Bits of the collision groups that are allowed to collide ith this collider. If not
   * set the mask will be inherited from the rigid body to which the collider was
   * attached to.
   *
   * Do not update this directly. Use `setFilterData()` instead.
   *
   * @see group
   * @see RigidBody.mask
   */
  public mask?: number;

  /** @inheritDoc */
  public sensor = false;

  /**
   * Bitmask that contains all tags that are currently set. The amount of maximum
   * available tags is limited to 32.
   */
  public tags = 0;

  /**
   * @param shape Physical shape of the collider.
   * @param material (optional) The colliders material.
   */
  constructor(public shape: T, public material?: Material) {}

  /**
   * Creates a collider with a `Rectangle` shape.
   * @see Rectangle
   */
  public static rect(width: number, height: number, x?: number, y?: number): Collider<Rectangle> {
    return new Collider(new Rectangle(width, height, x, y));
  }

  /**
   * Creates a collider with a `Circle` shape.
   * @see Circle
   */
  public static circle(radius: number, x?: number, y?: number): Collider<Circle> {
    return new Collider(new Circle(radius, x, y));
  }

  /**
   * Converts the collider into a sensor.
   * @see sensor
   */
  public toSensor(): this {
    this.sensor = true;

    return this;
  }

  /**
   * Adds all tags stored in the given tag `mask`.
   *
   * ```ts
   * const A = 1;
   * const B = 2;
   *
   * // Adds tag A.
   * tags.tag(A);
   *
   * // Adds tag A and B at once.
   * tags.tag(A | B);
   * ```
   */
  public tag(mask: number): this {
    this.tags |= mask;

    return this;
  }

  /**
   * Removes all tags stored in the given tag `mask`.
   *
   * ```ts
   * const A = 1;
   * const B = 2;
   *
   * // Removes tag A.
   * tags.untag(A);
   *
   * // Removes tag A and B at once.
   * tags.untag(A | B);
   * ```
   */
  public untag(mask: number): this {
    this.tags &= ~mask;

    return this;
  }

  /** Returns `true` if all tags in the given tag `mask` are set. */
  public hasTags(mask: number): boolean {
    return Boolean((this.tags & mask) === mask);
  }

  /**
   * Updates the collision filter data.
   *
   * @param groups Collision group bits.
   * @param mask Collision mask bits.
   *
   * @see group
   * @see mask
   */
  public setFilterData(groups: number, mask: number): this {
    this.group = groups;
    this.mask = mask;

    this.isDirty = true;

    return this;
  }

}


