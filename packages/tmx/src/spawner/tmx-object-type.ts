import { Entity, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../../parser';


/**
 * Implementation of a {@link TmxObject} type.
 *
 * Used by all objects that match the {@link type} of this implementation, or as a
 * default type if left `undefined`. There can only be one implementation per type
 * property, including the default implementation.
 *
 * - `O`: Type of object that can be transformed.
 */
export interface TmxObjectType<O extends TmxObject = TmxObject> {

  /**
   * The {@link TmxObject} type for which this type implementation is used. If this
   * is `undefined`, it will be used as a default type instead. There can only be
   * one implementation per type property, including the default implementation.
   */
  readonly type?: string;

  /**
   * Creates an entity from the given {@link TmxObject}.
   *
   * @param world Entity world.
   * @param map Map asset where the object is created.
   * @param layer Map layer on which the object is created.
   * @param obj Object that should be created.
   */
  create(world: World, map: TmxMapAsset, layer: TmxObjectLayer, obj: O): Entity | Promise<Entity>;

}
