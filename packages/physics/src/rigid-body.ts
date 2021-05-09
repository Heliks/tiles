import { Transform, vec2 } from '@heliks/tiles-engine';
import { Collider, ColliderData, ColliderShape } from './collider';

export enum RigidBodyType {
  /**
   * Static bodies do not react to forces like impulses and can only be moved manually by
   * manipulating the x and y position. This is the default for all newly created bodies.
   * Does not collide with other static or kinematic bodies.
   */
  Static,
  /**
   * Dynamic bodies react to external forces (e.g. impulses, collisions etc.) and can
   * be moved by applying velocity. They collide with all other body types.
   */
  Dynamic,
  /**
   * Kinematic bodies do not react to external forces like impulses but unlike static
   * bodies they can be moved with velocity. Kinematic bodies only collide with static or
   * other kinematic bodies.
   */
  Kinematic
}

/** A bit mask for a collision group that collides with all other collision groups. */
export const COLLIDE_ALL_MASK = 0xFFFF;

/** A 2D rigid body component. */
export class RigidBody {

  /** Colliders attached to this body. */
  public colliders: Collider[] = [];

  /**
   * Linear damping that is applied to the whole body. This determines how much the
   * velocity of the body degrades over time in relation to the worlds gravity. In top-
   * down games where the world usually does not have a gravity this needs to be set to
   * an appropriate value for characters or they will continue to move forever.
   */
  public damping = 0;

  /**
   * If this flag is set to `true`, the entire rigid body will be re-build on the next
   * frame. Some changes to the rigid body require this to take effect.
   */
  public dirty = true;

  /**
   * Bits that determine the rigid bodies collision groups. This can exclude other rigid
   * bodies from colliding with this one, depending on their own collision [[mask]].
   */
  public group = 0x0001;

  /**
   * Enables continuous collision detection on all colliders which prevents small
   * colliders (like bullets would usually have) from passing through thin bodies when
   * travelling at high velocity.
   */
  public isBullet = false;

  /**
   * Bits that determine with which collision groups we are allowed to collide with. By
   * default we will collide with all other groups.
   */
  public mask = COLLIDE_ALL_MASK;

  /** Set to `true` to allow the rigid body to rotate. */
  public rotate = false;

  /** Current velocity. */
  public velocity = vec2(0, 0);

  /** Transform flag indicating that the velocity was updated. */
  public isVelocityDirty = false;

  /**
   * If this value is `true` the position of the rigid body should be updated according
   * to the entities `Transform` values (instead of `Transform` being updated with the
   * body position). This will automatically be set during the body synchronization
   * before it is passed to the physics adapter. It must be cleared manually however.
   * @internal
   */
  public _isPositionDirty = false;

  /**
   * Keeps track of the last known position of the entity to determine when the entities
   * position was changed outside of the physics engine. If a changed position is found
   * the [[isPositionDirty]] flag will be set to `true` so that the physics engine can
   * update the body position.
   * @internal
   */
  public _position = vec2(0, 0);


  /**
   * @param type The type of the rigid body (e.g. static, kinematic etc.).
   */
  constructor(public readonly type = RigidBodyType.Static) {}

  /** Creates a new dynamic rigid body. */
  public static dynamic(): RigidBody {
    return new RigidBody(RigidBodyType.Dynamic);
  }

  /** Creates a new kinematic rigid body. */
  public static kinematic(): RigidBody {
    return new RigidBody(RigidBodyType.Kinematic);
  }

  /** Attaches a `Collider` with the given `shape` to this body. */
  public attach(shape: ColliderShape, data?: Partial<ColliderData>): this {
    // Fixme: This is prone to id collisions, but for now this works.
    const collider = new Collider(this.colliders.length, shape);

    if (data) {
      Object.assign(collider, data);
    }
    
    this.colliders.push(collider);

    return this;
  }

  /** Updates the velocity. */
  public setVelocity(x: number, y: number): this {
    this.velocity.x = x;
    this.velocity.y = y;

    this.isVelocityDirty = true;

    return this;
  }

  // Todo: The tag system is currently a work around. Will probably be removed when I
  //  find a better way to do this.
  // eslint-disable
  public tags: string[] = [];

  public tag(tag: string): this {
    if (!~this.tags.indexOf(tag)) {
      this.tags.push(tag);
    }

    return this;
  }

  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }
  // eslint-enable

}
