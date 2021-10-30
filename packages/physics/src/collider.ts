import { Entity } from '@heliks/tiles-engine';
import { Circle, Rectangle } from '@heliks/tiles-math';
import { MaterialId } from './material';


/** A shape that can be attached to a collider to give it its physical form. */
export type ColliderShape = Circle | Rectangle;

/** Collider config. */
export interface ColliderData {

  /**
   * The id of the material that should be used for the physical properties of this
   * collider. If not set a default material will be used.
   */
  material?: MaterialId;

  /**
   * If set to `true` the collider will act as a sensor. Sensors will detect collisions
   * but won't produce any responses and can only collide when one of the colliding
   * bodies is dynamic. E.g. when attached to a kinematic body a sensor won't detect
   * collisions with a static or another kinematic body.
   */
  sensor: boolean;

  /**
   * Custom user defined type. This has no impact on the behavior of this collider
   * whatsoever outside of user defined functionality that may operate on this
   * particular type.
   */
  type?: string | number

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
export class Collider implements ColliderData {

  /***/
  public readonly contacts: ColliderContact[] = [];

  /** @inheritDoc */
  public material?: MaterialId;

  /** @inheritDoc */
  public sensor = false;

  /** @inheritDoc */
  public type?: string | number;

  /**
   * @param id Id that is unique to the body to which this collider is attached to.
   * @param shape Physical shape of the collider.
   */
  constructor(public readonly id: number, public shape: ColliderShape) {}

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


