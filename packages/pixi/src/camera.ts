import { Injectable } from '@heliks/tiles-engine';
import { Screen } from './screen';
import { Vec2, vec2 } from '@heliks/tiles-math';

@Injectable()
export class Camera {

  /** Local position in the world. */
  public readonly world = vec2(0, 0);

  public x = 0;
  public y = 0;

  constructor(private readonly screen: Screen) {}

  /** Transforms the camera position using the given `x` and `y` local position. */
  public transform(x: number, y: number): this {
    this.world.x = x;
    this.world.y = y;

    return this;
  }

  /** Converts a `position` on the screen to a position in the game world. */
  public toWorld(position: Vec2, out = vec2(0, 0)): Vec2 {
    out.x = ((position.x / this.screen.scale.x) - (this.world.x) ) / this.screen.unitSize;
    out.y = ((position.y / this.screen.scale.y) - (this.world.y) ) / this.screen.unitSize;

    return out;
  }

  /** Converts a `position` in the world space to a position on the screen. */
  public toScreen(position: Vec2, out = vec2(0, 0)): Vec2 {
    out.x = (-position.x * this.screen.unitSize) + (this.screen.resolution.x / 2);
    out.y = (-position.y * this.screen.unitSize) + (this.screen.resolution.y / 2);

    return out;
  }

}
