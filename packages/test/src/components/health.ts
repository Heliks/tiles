import { clamp } from "@tiles/engine";

export class Health {

  /**
   * @param total The maximum amount of health that this entity can possibly have.
   * @param current The current amount of health that this entity has. The
   *  maximum value of this is capped by [[total]].
   */
  constructor(public total = 0, public current = 0) {}

  /**
   * Sets the current health to `value`. If it exceeds [[total]] it will
   * be clamped accordingly.
   */
  public set(value: number): this {
    this.current = clamp(value, value, this.total);

    return this;
  }

}
