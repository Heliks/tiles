import { Entity, Inject, Injectable, Parent, Transform, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../../parser';
import { TmxSpawnerConfig } from '../tmx-spawner-config';
import { TmxDefaultObjectFactory } from './tmx-default-object-factory';
import { TmxObjectFactory } from './tmx-object-factory';
import { TmxObjectMetadata } from './tmx-object-metadata';


@Injectable()
export class TmxObjectSpawner {

  /** @internal */
  private readonly factories = new Map<string, TmxObjectFactory>();

  /**
   * @param config Spawner config.
   * @param factory The {@link TmxObjectFactory factory} used to create entities
   *  from map objects. This factory will only be used if the object that is being
   *  spawned does not have its own factory defined.
   */
  constructor(@Inject(TmxDefaultObjectFactory) public factory: TmxObjectFactory, public readonly config: TmxSpawnerConfig) {}

  /**
   * Registers the given `factory` to be used to create entities from objects that
   * match its `type`. If the factory does not specify a type, it will be used as
   * the default object factory.
   */
  public register(factory: TmxObjectFactory): this {
    if (factory.type) {
      this.factories.set(factory.type, factory);
    }
    else {
      this.factory = factory;
    }

    return this;
  }

  /**
   * Returns the appropriate {@link TmxObjectFactory} for the given object type`. Returns
   * the default {@link factory} if that type does not have its own.
   */
  public getFactory(type?: string): TmxObjectFactory {
    // Safety: Using an undefined key should always fail to return a factory, therefore
    // we don't need the additional check here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.factories.get(type!) ?? this.factory;
  }

  public createLocalTransform(map: TmxMapAsset, obj: TmxObject): Transform {
    const x = (obj.shape.x / this.config.unitSize) - (map.grid.cols / 2);
    const y = (obj.shape.y / this.config.unitSize) - (map.grid.rows / 2);

    return new Transform(0, 0, 0, x, y);
  }

  public async spawn(world: World, root: Entity, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): Promise<Entity> {
    const entity = await this.getFactory(obj.type).create(world, map, layer, obj);

    world.attach(entity, new TmxObjectMetadata(obj.id, obj.name));
    world.attach(entity, new Parent(root));
    world.attach(entity, this.createLocalTransform(map, obj));

    return entity;
  }

}
