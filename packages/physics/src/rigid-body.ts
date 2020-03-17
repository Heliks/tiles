import { Vec2 } from "@tiles/engine";

export enum RigidBodyType {
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
  public type = RigidBodyType.Static;

  public velocity: Vec2 = [0, 0];
  public velocityTransform?: Vec2;

  public dirty = true;

  public transformVelocity(x: number, y: number): this {
    this.velocityTransform = [x, y];

    return this;
  }

  public attach(bodyPart: BodyPart): this {
    this.bodyParts.push(bodyPart);
    this.dirty = true;

    return this;
  }

}
