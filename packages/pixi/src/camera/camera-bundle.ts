import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { Camera } from './camera';
import { CameraEffects } from './camera-effects';


export class CameraBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .provide(Camera)
      .system(CameraEffects);
  }

}