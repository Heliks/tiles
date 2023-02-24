import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { TmxSpawnerConfig } from './tmx-spawner-config';
import { TmxPhysicsFactory } from './tmx-physics-factory';
import { TmxSpawner } from './tmx-spawner';
import { TmxSpawnMap } from './tmx-spawn-map';
import { TmxSpawnerSystem } from './tmx-spawner-system';


/**
 * ## Physics
 *
 * ### Measurements
 *
 * If physics are involved it's usually recommended to not use pixel values for positions
 * and measurements, as most physics engines work best with small numbers. To allow this,
 * the tmx spawner can convert appropriate units with a `unitSize`. For example, a shape
 * that would normally be 32x32 pixels, would only be 2x2 with a unit size of `16`.
 */
export class TmxSpawnerBundle implements Bundle {

  /**
   * @param unitSize Amount of pixels that are equivalent to one game unit.
   */
  constructor(public unitSize = 1) {}

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .component(TmxSpawnMap)
      .provide({
        token: TmxSpawnerConfig,
        value: new TmxSpawnerConfig(this.unitSize)
      })
      .provide(TmxPhysicsFactory)
      .provide(TmxSpawner)
      .system(TmxSpawnerSystem);
  }

}
