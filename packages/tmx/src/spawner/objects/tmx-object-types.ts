import { EntityBuilder, World } from '@heliks/tiles-engine';
import { TmxObjectLayer, TmxMapAsset, TmxObject } from '../../parser';


/**
 * Implementation of an object type.
 *
 * Object types compose entities from {@link TmxObject objects}. Each type (or "class"
 * as it is called in newer tiled versions) can have its own implementation.
 */
export interface TmxObjectType {

  /**
   * Called when an entity is composed from a {@link TmxObject object}.
   *
   * If you want to customize the spawn process of your objects, or if a specific object
   * type requires a specific set of components, this can be done here.
   *
   * @param world World in which the entity is composed.
   * @param entity The entity builder used to compose the entity.
   * @param map Map on which the object is found.
   * @param layer Layer on which the object is found.
   * @param obj The object from which the entity is composed.
   */
  compose(world: World, entity: EntityBuilder, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): void;

}

/**
 * Manages available {@link TmxObjectType object types} and maps them to their respective
 * IDs. The ID is the "type" (or "class" for newer versions) field in tiled.
 */
export class TmxObjectTypes {

  /** Contains all available {@link TmxObjectType object types}, mapped to their ID. */
  public readonly items = new Map<string, TmxObjectType>();

  /**
   * @param def Contains the {@link TmxObjectType object type} that is used to
   *  compose {@link TmxObject objects} that do not have a custom type.
   */
  constructor(public def: TmxObjectType) {}

  /**
   * Registers a custom {@link TmxObjectType object type}. Throws an error if `id` is
   * already used by a different type.
   */
  public register(id: string, type: TmxObjectType): this {
    if (this.items.has(id)) {
      throw new Error(`Custom object type ID "${id}" is already in use.`);
    }

    this.items.set(id, type);

    return this;
  }

}
