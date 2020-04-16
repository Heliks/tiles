import { Vec2 } from "@tiles/engine";

export enum RigidBodyType {
  Dynamic,
  Kinetic,
  Static
}

export enum BodyPartType {
  Rect
}

export interface BodyPartData {
  density?: number;
  friction?: number;
  position?: Vec2;
}

export interface RectangleBodyPart extends BodyPartData {
  data: [number, number];
  type: BodyPartType.Rect;
}

export type BodyPart = RectangleBodyPart;

export const COLLIDE_ALL_MASK = 0xFFFF;

/**
 * A 2D rigid body component.
 */
export class RigidBody {

  public bodyParts: BodyPart[] = [];

  /**
   * The linear damping that is applied to the whole body. This determines how
   * much the velocity of the body degrades over time in relation to the worlds
   * gravity. In top-down games where the world usually does not have a gravity,
   * this needs to be set to an appropriate value for characters or they will
   * continue to move forever.
   */
  public damping = 0;

  /**
   * If this flag is set to true, the entire rigid body will be re-build on the
   * next frame. Some changes to the rigid body require this to take effect.
   */
  public dirty = true;

  /**
   * Bits that determine the rigid bodies collision groups. This can exclude
   * other rigid bodies from colliding with this one, depending on their
   * collision [[mask]].
   */
  public group = 0x0001;

  /**
   * Enables continuous collision detection on all body parts, which prevents small
   * body parts (like bullets would usually have) from passing through thin bodies
   * when travelling at high velocity.
   */
  public isBullet = false;

  /**
   * Bits that determine with which collision groups this rigid body is allowed to
   * collide. By default it will collide with all other groups.
   */
  public mask = COLLIDE_ALL_MASK;

  /**
   * Value between 0 and 1 that determines how "bouncy" each body parts should be,
   * closer to 0 is less bouncy, closer to 1 more.
   */
  public restitution = 0;

  public velocity: Vec2 = [0, 0];
  public transVelocity?: Vec2;



  public tags: string[] = [];

  public tag(tag: string): this {
    if (!~this.tags.indexOf(tag)) {
      this.tags.push(tag);
    }

    return this;
  }


  constructor(public type = RigidBodyType.Static) {}

  public setType(type: RigidBodyType): this {
    this.type = type;
    this.dirty = true;

    return this;
  }

  public transformVelocity(x: number, y: number): this {
    this.transVelocity = [x, y];

    return this;
  }

  public attach(bodyPart: BodyPart): this {
    this.bodyParts.push(bodyPart);
    this.dirty = true;

    return this;
  }

}
