import { Entity, Inject, Injectable, Transform, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../parser';
import { TmxObjectMetadata } from './tmx-object-metadata';
import { TmxObjectType } from './tmx-object-type';
import { TmxObjectTypeDefault } from './tmx-object-type-default';
import { TmxSpawnerConfig } from './tmx-spawner-config';


@Injectable()
export class TmxObjectSpawner {

  /** @internal */
  private readonly factories = new Map<string, TmxObjectType>();

  /**
   * @param config Spawner config.
   * @param factory The {@link TmxObjectFactory factory} used to create entities
   *  from map objects. This factory will only be used if the object that is being
   *  spawned does not have its own factory defined.
   */
  constructor(@Inject(TmxObjectTypeDefault) public factory: TmxObjectType, public readonly config: TmxSpawnerConfig) {}

  /**
   * Registers the given `factory` to be used to create entities from objects that
   * match its `type`. If the factory does not specify a type, it will be used as
   * the default object factory.
   */
  public register(factory: TmxObjectType): this {
    if (factory.type) {
      this.factories.set(factory.type, factory);
    }
    else {
      this.factory = factory;
    }

    return this;
  }

  /**
   * Returns the appropriate {@link TmxObjectType} for the given object type`. Returns
   * the default {@link factory} if that type does not have its own.
   */
  public getFactory(type?: string): TmxObjectType {
    // Safety: Using an undefined key should always fail to return a factory, therefore
    // we don't need the additional check here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.factories.get(type!) ?? this.factory;
  }

  public async spawn(world: World, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): Promise<Entity> {
    const entity = await this.getFactory(obj.type).create(world, map, layer, obj);

    world.attach(entity, new TmxObjectMetadata(
      obj.id,
      obj.properties,
      obj.name
    ));

    world.attach(entity, new Transform(
      obj.shape.x / this.config.unitSize, 
      obj.shape.y / this.config.unitSize
    ));

    return entity;
  }

}
