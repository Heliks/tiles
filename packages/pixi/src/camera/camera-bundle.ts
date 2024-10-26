import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '../pixi-bundle';
import { Camera } from './camera';
import { CameraEffects } from './camera-effects';
import { CameraSystem } from './camera-system';


/** Provides basic camera functionality. */
export class CameraBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .provide(Camera)
      .provide(CameraEffects)
      .system(CameraSystem, RendererSchedule.Update);

  }

}
