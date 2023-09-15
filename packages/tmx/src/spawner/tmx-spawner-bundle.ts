import { AppBuilder, Bundle, Container as ServiceContainer, Type } from '@heliks/tiles-engine';
import { DefaultObjectType, TmxObjectType, TmxObjectTypes } from './objects';
import { TmxPhysicsFactory } from './tmx-physics-factory';
import { TmxSpawnMap } from './tmx-spawn-map';
import { TmxSpawner } from './tmx-spawner';
import { TmxSpawnerConfig } from './tmx-spawner-config';
import { TmxSpawnerSystem } from './tmx-spawner-system';


/** @internal */
type RegisterObjectTypeParams = [type: Type<TmxObjectType>] | [id: string, type: Type<TmxObjectType>];

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
  private defaultObjectType?: Type<TmxObjectType>;

  /** @internal */
  private types = new Map<string, Type<TmxObjectType>>();

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
  private createDefaultObjectType(container: ServiceContainer): TmxObjectType {
    return container.make(this.defaultObjectType ?? DefaultObjectType);
  }

  /** @internal */
  private createObjectTypeRegistry(container: ServiceContainer): TmxObjectTypes {
    const types = new TmxObjectTypes(this.createDefaultObjectType(container));

    for (const [id, type] of this.types) {
      types.register(id, container.make(type));
    }

    return types;
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .component(TmxSpawnMap)
      .provide(TmxSpawnerConfig, new TmxSpawnerConfig(this.unitSize))
      .singleton(TmxObjectTypes, this.createObjectTypeRegistry.bind(this))
      .provide(TmxPhysicsFactory)
      .provide(TmxSpawner)
      .system(TmxSpawnerSystem);
  }

  /**
   * Overwrites the default {@link TmxObjectType object type} {@link Type type } used to
   * compose entities for {@link TmxObject objects} that do not have a custom type.
   */
  public type(type: Type<TmxObjectType>): this;

  /**
   * Registers a custom {@link TmxObjectType object type}. Throws an error if `id` is
   * already used by a different type.
   */
  public type(id: string, type: Type<TmxObjectType>): this;

  /** @internal */
  public type(...params: RegisterObjectTypeParams): this {
    // If we have no ID, set given object type as default.
    if (params.length === 1) {
      this.defaultObjectType = params[0];

      return this;
    }

    const [ id, type ] = params;

    if (this.types.has(id)) {
      throw new Error(`Custom object type ID "${id}" is already in use.`);
    }

    this.types.set(id, type);

    return this;
  }


}
