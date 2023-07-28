import { Injectable, System, World } from '@heliks/tiles-engine';
import { Camera } from './camera';


export interface CameraEffect {

  /** Called once when the camera effect starts. */
  start?(world: World, camera: Camera): void;

  /**
   * Called while the effect is being used. When this function returns `true`, the effect
   * is considered complete and will be removed from the camera.
   */
  update(world: World, camera: Camera): boolean;

}

@Injectable()
export class CameraEffects implements System {

  private readonly effects: CameraEffect[] = [];

  constructor(private readonly camera: Camera) {}

  public add(effect: CameraEffect): this {
    this.effects.push(effect);

    return this;
  }

  public update(world: World): void {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];

      if (effect.update(world, this.camera)) {
        this.effects.splice(i, 1);
      }
    }
  }

}
