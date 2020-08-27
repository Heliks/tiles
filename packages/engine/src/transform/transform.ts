import { Vec2 } from '../types';

export class Transform {

  /**
   * @param x Position on the x axis. This can be any unit depending on the renderer
   *  or physics engine, but in most cases it will be meters.
   * @param y Position on the y axis. Like [[x]] this can be any unit.
   * @param rotation The rotation of the entity in radians.
   */
  constructor(public x = 0, public y = 0, public rotation = 0) {}

  public setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

  public toVec2(): Vec2 {
    return [ this.x, this.y ];
  }

  public clone(): Transform {
    return new Transform(this.x, this.y, this.rotation);
  }

  public transform(x: number, y: number, rotation: number): this {
    this.rotation = rotation;

    this.x = x;
    this.y = y;

    return this;
  }

}
