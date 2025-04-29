import { AppBuilder, Bundle, Type, World } from '@heliks/tiles-engine';
import { TmxMapLoader } from './tmx-map-loader';
import { TmxObjectComposer } from './tmx-object-composer';
import { TmxObjectMetadata } from './tmx-object-metadata';
import { TmxObjectSpawner } from './tmx-object-spawner';
import { TmxObjectType } from './tmx-object-type';
import { TmxObjectTypeDefault } from './tmx-object-type-default';
import { TmxPhysicsFactory } from './tmx-physics-factory';
import { TmxSpawner } from './tmx-spawner';
import { TmxSpawnerConfig } from './tmx-spawner-config';
import { TmxSpawnerSystem } from './tmx-spawner-system';


/**
 * Map spawner / handler for TMX tilemaps.
 *
 * Latest supported TMX version: 1.10.2
 *
 * ## Physics
 *
 * When using a physics engine, it's recommended to define a `unitSize` to convert Tileds
 * pixel values into arbitrary units. For example, a 32x32px shape, would shrink to 2x2
 * with a unit size of `16`.
 *
 * ### Geometry
 *
 * Floating geometry on object layers *other than points* will have their geometrical
 * shape attached to them as a {@link RigidBody}.
 *
 * Ellipses are converted into circles by the TMX parser.
 *
 * ### Object types
 *
 * Custom object types can be created to customize the spawning behavior of certain
 * types of map objects, or to modify the default spawning behavior.
 *
 * ```ts
 *  // This object type handles map objects with the type "foo".
 *  class MyDefaultType implements TmxObjectType {
 *
 *    public create(): Entity {
 *      ....
 *    }
 *
 *  }
 *
 *  // This object type overwrites the default spawning behavior.
 *  class MyDefaultType implements TmxObjectType {
 *
 *    // This object type only matches TMX objects that have this type.
 *    public readonly type = 'foo';
 *
 *    public create(): Entity {
 *      ....
 *    }
 *
 *  }
 *
 *  runtime()
 *    // ...
 *    .bundle(
 *      new TmxSpawnerBundle()
 *        .type(MyDefaultType)
 *        .type(MyCustomType)
 *    )
 * ```
 */
export class TmxSpawnerBundle implements Bundle {

  /** @internal */
  private types = new Set<Type<TmxObjectType>>();

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

    for (const type of this.types) {
      spawner.add(world.make(type));
    }
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .type(TmxObjectMetadata)
      .provide(TmxSpawnerConfig, new TmxSpawnerConfig(this.unitSize))
      .provide(TmxPhysicsFactory)
      .provide(TmxObjectComposer)
      .provide(TmxObjectTypeDefault)
      .provide(TmxObjectSpawner)
      .provide(TmxSpawner)
      .system(TmxSpawnerSystem)
      .system(TmxMapLoader)
      .run(this.setup.bind(this));
  }

  /**
   * Overwrites the default {@link TmxObjectType object type} {@link Type type } used to
   * compose entities for {@link TmxObject objects} that do not have a custom type.
   */
  public type(type: Type<TmxObjectType>): this {
    this.types.add(type);

    return this;
  }

}
