import { AppBuilder, Bundle, Type, World } from '@heliks/tiles-engine';
import { TmxDefaultObjectFactory, TmxObjectFactory, TmxObjectSpawner } from './objects';
import { TmxPhysicsFactory } from './tmx-physics-factory';
import { TmxSpawnMap } from './tmx-spawn-map';
import { TmxSpawner } from './tmx-spawner';
import { TmxSpawnerConfig } from './tmx-spawner-config';
import { TmxSpawnerSystem } from './tmx-spawner-system';


/**
 * ## Physics
 *
 * ### Object types
 *
 * Sometimes it's necessary to manually compose an object rather than letting the spawner
 * do it automatically. For this, you can use a custom object type (or "class" in newer
 * versions) in tiled and {@link type register} your custom {@link TmxObjectType type}
 * implementation on the spawner.
 *
 * ### Measurements
 *
 * If physics are involved it's usually recommended to not use pixel values for positions
 * and measurements, as most physics engines work best with small numbers. To allow this,
 * the tmx spawner can convert appropriate units with a `unitSize`. For example, a shape
 * that would normally be 32x32 pixels, would only be 2x2 with a unit size of `16`.
 */
export class TmxSpawnerBundle implements Bundle {

  /** @internal */
  private factories = new Set<Type<TmxObjectFactory>>();

  /**
   * @param unitSize Amount of pixels that are treated as one in-game unit by the
   *  spawner. If physics are used it is highly recommended to work with small numbers,
   *  hence why pixels should be converted to an arbitrary unit of measurement.
   *
   *  For example, using a unit size of `16`, an object that is placed at the position
   *  x: 32 y: 32 in the tiled editor, will have that position converted to a world
   *  position of x: 2 y: 2.
   */
  constructor(public unitSize: number) {}

  /** @internal */
  private setup(world: World): void {
    const spawner = world.get(TmxObjectSpawner);

    for (const type of this.factories) {
      spawner.register(world.make(type));
    }
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .component(TmxSpawnMap)
      .provide(TmxSpawnerConfig, new TmxSpawnerConfig(this.unitSize))
      .provide(TmxPhysicsFactory)
      .provide(TmxDefaultObjectFactory)
      .provide(TmxObjectSpawner)
      .provide(TmxSpawner)
      .system(TmxSpawnerSystem)
      .run(this.setup.bind(this));
  }

  /**
   * Overwrites the default {@link TmxObjectType object type} {@link Type type } used to
   * compose entities for {@link TmxObject objects} that do not have a custom type.
   */
  public type(type: Type<TmxObjectFactory>): this {
    this.factories.add(type);

    return this;
  }

}
