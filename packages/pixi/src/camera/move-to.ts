import { Vec2, World } from '@heliks/tiles-engine';
import { Camera } from './camera';
import { CameraEffect } from './camera-effects';


/** @internal */
const MAX_DISTANCE = 5;

/** Smoothly moves the {@link Camera} to a certain point in the world. */
export class MoveTo implements CameraEffect {

  /** @internal */
  public readonly target: Vec2;

  /** @internal */
  private readonly dest = new Vec2();

  /**
   * @param x Target world position along x-axis.
   * @param y Target world position along y-axis.
   * @param speed Speed by which the camera moves.
   * @param arrival If set to `false`, the effect will not finish even if the camera
   *  has arrived at the target location and must be cleared manually.
   * @param tolerance Tolerance in location difference when determining if the camera has
   *  arrived at the target location.
   */
  constructor(
    x: number,
    y: number,
    public readonly speed = 1,
    public readonly arrival = true,
    public readonly tolerance = 0.01
  ) {
    this.target = new Vec2(x, y)
  }

  /** @inheritDoc */
  public update(world: World, camera: Camera): boolean {
    this.dest
      .copy(this.target)
      .sub(camera.world)
      .normalize()
      .scale(this.speed);

    const distance = camera.world.distance(this.target);

    // Move slower the closer we get to the target.
    if (distance < MAX_DISTANCE) {
      this.dest.scale(distance / MAX_DISTANCE);
    }

    camera.world.x += this.dest.x;
    camera.world.y += this.dest.y;

    return this.arrival && distance < this.tolerance;
  }

}
