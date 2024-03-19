import { Injectable, Screen, System, World } from '@heliks/tiles-engine';
import { RendererConfig } from '../config';
import { Layers } from '../layer';
import { Camera } from './camera';
import { CameraEffects } from './camera-effects';


/** Computes camera values. */
@Injectable()
export class CameraSystem implements System {

  /**
   * @param camera {@see Camera}
   * @param config
   * @param effects {@see CameraEffects}
   * @param layers {@see Layers}
   * @param screen {@see Screen}
   */
  constructor(
    public readonly camera: Camera,
    public readonly config: RendererConfig,
    public readonly effects: CameraEffects,
    public readonly layers: Layers,
    public readonly screen: Screen
  ) {}

  /**
   * Computes the pivot of the {@link Layers layers} container so that it is centered
   * on the camera position.
   */
  private computeScenePivot(): void {
    this.layers.container.pivot.set(
      (this.camera.world.x * this.camera.zoom * this.config.unitSize) - ((this.screen.size.x / this.screen.scale.x) >> 1),
      (this.camera.world.y * this.camera.zoom * this.config.unitSize) - ((this.screen.size.y / this.screen.scale.y) >> 1)
    );
  }

  /** Sets the scale on all {@link Layers layers} according to the camera zoom. */
  private updateLayerScales(): void {
    this.layers.container.scale.set(this.screen.scale.x, this.screen.scale.y)

    for (const layer of this.layers.items) {
      if (layer.isZoomEnabled) {
        layer.container.scale.set(this.camera.zoom);
      }
      else {
        layer.container.scale.set(1);
      }
    }
  }

  /**
   * Calls `update` on all active {@link CameraEffects camera effects} and removes the
   * from the list of active effects if they have completed.
   */
  private updateEffects(world: World): void {
    for (let i = this.effects.active.length - 1; i >= 0; i--) {
      const effect = this.effects.active[i];

      if (effect.update(world, this.camera)) {
        this.effects.active.splice(i, 1);
      }
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    if (this.camera.enabled) {
      this.updateLayerScales();
      this.updateEffects(world);
      this.computeScenePivot();
    }
  }

}
