import { Entity, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../../parser';


/**
 * Factory that creates a map entity from a {@link TmxObject}.
 *
 * Factories relate to a specific TMX "type" (or "class" in later versions) and will be
 * responsible for creating all entities of that type.
 */
export interface TmxObjectFactory {

  /**
   * The factory will spawn entities from TMX objects of this type ("or class"). If no
   * type is specified, this factory will be used as the default factory for objects
   * that either don't have a type or have a type without a special object factory.
   */
  readonly type?: string;

  /**
   * Implementations of the factory logic.
   *
   * @param world World to which the entity should be spawned.
   * @param map Map on which the object exists.
   * @param layer Map layer on which the object exists.
   * @param obj The object from which the entity should be created.
   */
  create(world: World, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): Entity | Promise<Entity>;

}
