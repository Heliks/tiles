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

/**
 * A 2D rigid body component.
 */
export class RigidBody {

  public bodyParts: BodyPart[] = [];

  /**
   * The linear damping that is applied to the whole body. This determines how
   * much the velocity of the body degrades over time in relation to the worlds
   * gravity. In top-down games where the world usually does not have a gravity,
   * this needs to be set to an appropriate value for characters or it will
   * continue to move forever.
   */
  public damping = 0;

  public velocity: Vec2 = [0, 0];
  public velocityTransform?: Vec2;

  public dirty = true;

  constructor(public type = RigidBodyType.Static) {}

  public setType(type: RigidBodyType): this {
    this.type = type;
    this.dirty = true;

    return this;
  }

  public transformVelocity(x: number, y: number): this {
    this.velocityTransform = [x, y];

    return this;
  }

  public attach(bodyPart: BodyPart): this {
    this.bodyParts.push(bodyPart);
    this.dirty = true;

    return this;
  }

  public static dynamic() {
    return new RigidBody();
  }

}
