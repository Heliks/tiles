import { Circle, Rectangle, TypeId, uuid } from '@heliks/tiles-engine';
import { Material } from './material';


/** A shape that can be attached to a collider to give it its physical form. */
export type ColliderShape = Circle | Rectangle;

/** Collider config. */
export interface ColliderData {

  /**
   * Material that defines physical properties such as friction and restitution.
   *
   * If not defined, the material may be inherited from the body to which this
   * collider is attached to.
   */
  material?: Material;

  /**
   * If set to `true`, the collider will act as a sensor.
   *
   * Sensors participate in collision detection and contact events but do not produce a
   * physical collision response.
   *
   * A sensor can only collide with bodies that are {@link RigidBodyType.Dynamic}. When
   * a sensor is attached to a {@link RigidBodyType.Kinematic} body, it will not detect
   * collisions with {@link RigidBodyType.Static} or other kinematic bodies.
   */
  sensor: boolean;

}


/**
 * Defines the physical shape and collision properties of a body part that will be
 * attached to a {@link RigidBody}.
 */
@TypeId('tiles_physics_collider')
export class Collider<T extends ColliderShape = ColliderShape> implements ColliderData {

  /** Unique identifier. */
  public readonly id = uuid();

  /** Indicates that the collider requires an update. */
  public dirty = false;

  /**
   * Bitmask defining the collision groups this collider belongs to.
   *
   * If not set, the group will be inherited from the attached rigid body.
   * Use {@link setGroup} to modify this value.
   */
  public group?: number;

  /**
   * Bitmask defining which collision groups this collider can collide with.
   *
   * If not set, the mask will be inherited from the attached rigid body.
   * Use {@link setMask} to modify this value.
   */
  public mask?: number;

  /** @inheritDoc */
  public sensor = false;

  /**
   * Bitmask containing application-defined tags associated with this collider.
   *
   * Tags can be used for lightweight categorization, filtering, or gameplay
   * logic (e.g. "enemy", "ground", "trigger"). A maximum of 32 tags is supported.
   */
  public tags = 0;

  /**
   * @param shape Physical shape of the collider. Modifying the shape after the collider
   *  has been attached may require the rigid body or collider to be rebuilt by the
   *  physics engine.
   * @param material (optional) The colliders material.
   */
  constructor(public shape: T, public material?: Material) {}

  /**
   * Creates a collider with a `Rectangle` shape.
   *
   * @see Rectangle
   */
  public static rect(width: number, height: number, x?: number, y?: number): Collider<Rectangle> {
    return new Collider(new Rectangle(width, height, x, y));
  }

  /**
   * Creates a collider with a `Circle` shape.
   *
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
    this.dirty = true;

    return this;
  }

  /** Updates the collision {@link mask}. Marks the collider as {@link dirty}. */
  public setMask(mask: number): this {
    this.dirty = true;
    this.mask = mask;

    return this;
  }

  /** Updates the collision {@link group}. Marks the collider as {@link dirty}. */
  public setGroup(group: number): this {
    this.dirty = true;
    this.group = group;

    return this;
  }

}


