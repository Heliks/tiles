import { Injectable } from '@heliks/tiles-engine';
import { Vec2, vec2 } from '@heliks/tiles-math';


@Injectable()
export class Camera {

  /**
   * Enables or disables the camera. The position of the camera can still be updated
   * while it is disabled, but it will not update the screen until it is enabled again.
   */
  public enabled = true;

  /**
   * Cameras world position. Do not modify this directly.
   * @see transform
   */
  public readonly world = vec2(0, 0);

  /** Transforms the camera position using the given `x` and `y` local position. */
  public transform(x: number, y: number): this {
    this.world.x = x;
    this.world.y = y;

    return this;
  }

  /**
   * Converts a screen `position`  to a position in the world space. This modifies the
   * original input.
   */
  public toWorldPosition(position: Vec2): Vec2 {
    throw new Error('Todo');
  }

  /**
   * Converts a world `position` to a position on the screen. This modifies the
   * original input.
   */
  public toScreenPosition(position: Vec2): Vec2 {
    throw new Error('Todo');
  }

}
