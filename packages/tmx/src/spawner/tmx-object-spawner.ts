import { Entity, Inject, Injectable, Transform, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../parser';
import { TmxObjectMetadata } from './tmx-object-metadata';
import { TmxObjectType } from './tmx-object-type';
import { TmxObjectTypeDefault } from './tmx-object-type-default';
import { TmxSpawnerConfig } from './tmx-spawner-config';


@Injectable()
export class TmxObjectSpawner {

  /** @internal */
  private readonly types = new Map<string, TmxObjectType>();

  /**
   * @param def Default object type. Used when an object specifies no custom TMX type
   *  or if there is no implementation for its specified type.
   * @param config Spawner config.
   */
  constructor(
    @Inject(TmxObjectTypeDefault)
    public def: TmxObjectType,
    public readonly config: TmxSpawnerConfig
  ) {}

  /**
   * Adds the given object `type`.
   *
   * If the type does not specify a custom TMX type to match, it will be used as the new
   * default for objects that don't specify a type on their own.
   */
  public add(type: TmxObjectType): this {
    if (type.type) {
      this.types.set(type.type, type);
    }
    else {
      this.def = type;
    }

    return this;
  }

  /**
   * Returns the appropriate {@link TmxObjectType} that matches the given TMX custom
   * type. If no TMX type is provided, or if there is no implementation for it, the
   * default object type will be returned instead.
   */
  public get(type?: string): TmxObjectType {
    // Safety: Using an undefined key should always fail to return a factory, therefore
    // we don't need the additional check here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.types.get(type!) ?? this.def;
  }

  public async spawn(world: World, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): Promise<Entity | void> {
    const type = this.get(obj.type);

    if (type.ignore(map, obj)) {
      return;
    }

    const entity = await type.create(world, map, layer, obj);

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
