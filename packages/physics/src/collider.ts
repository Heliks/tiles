import { Entity, Circle, Rectangle, uuid } from '@heliks/tiles-engine';
import { MaterialId } from './material';


/** A shape that can be attached to a collider to give it its physical form. */
export type ColliderShape = Circle | Rectangle;

/** Collider config. */
export interface ColliderData {

  /**
   * Id of a physics material. If this is set the collider will inherit physical
   * properties of that material such as friction or restitution.
   * @see Material
   */
  material?: MaterialId;

  /**
   * If set to `true` the collider will act as a sensor. Sensors will detect collisions
   * but won't produce any responses and can only collide when one of the colliding
   * bodies is dynamic. E.g. when attached to a kinematic body a sensor won't detect
   * collisions with a static or another kinematic body.
   */
  sensor: boolean;

}

export interface ColliderContact {
  /** Id of the collider with which we are colliding. */
  colliderId: number;
  /** Entity which with we are colliding with. */
  entity: Entity;
}

/**
 * Colliders are the shapes of rigid bodies that are actually colliding (e.g. the body
 * parts) with each other.
 */
export class Collider<T extends ColliderShape = ColliderShape> implements ColliderData {

  /** Unique identifier. */
  public readonly id = uuid();

  /***/
  public readonly contacts: ColliderContact[] = [];

  /** @inheritDoc */
  public material?: MaterialId;

  /** @inheritDoc */
  public sensor = false;

  /**
   * Contains all assigned tags.
   *
   * Tags can be used to identify the collider. They do not have any immediate effect
   * on how the physics of the collider behaves.
   */
  public readonly tags = new Set<string>();

  /**
   * @param shape Physical shape of the collider.
   */
  constructor(public shape: T) {}

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
   * Tags the collider with one or more user defined tags.
   * @see tags
   */
  public tag(...tags: string[]): this {
    for (const tag of tags) {
      this.tags.add(tag);
    }

    return this;
  }

  /**
   * Returns `true` if the collider is tagged with all given `tags`.
   * @see tags
   */
  public hasTags(...tags: string[]): boolean {
    for (const tag of tags) {
      if (! this.tags.has(tag)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Converts the collider into a sensor.
   * @see sensor
   */
  public toSensor(): this {
    this.sensor = true;

    return this;
  }

  /** Registers a new contact with the collider of another entity. */
  public addContact(entity: Entity, colliderId: number): this {
    this.contacts.push({
      colliderId,
      entity
    });

    return this;
  }

  /**
   * Removes the contact between this collider and the collider of `entity` matching
   * `colliderId`.
   */
  public removeContact(entity: Entity, colliderId: number): this {
    const index = this.contacts.findIndex(
      item => item.entity === entity && item.colliderId === colliderId
    );

    if (~index) {
      this.contacts.splice(index, 1);
    }

    return this;
  }

}


