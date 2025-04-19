import { Entity, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../parser';


/**
 * Transforms {@link TmxObject} with a custom type that match the {@link type} of this
 * implementation into entities. If no type is specified, it will match any TMX object
 * that either has no custom type, or if its type has no {@link TmxObjectType}.
 *
 * - `O`: Viable TMX object that can be matched by this type.
 */
export interface TmxObjectType<O extends TmxObject = TmxObject> {

  /**
   * The {@link TmxObject} type for which this type implementation is used. If this
   * is `undefined`, it will be used as a default type instead. There can only be
   * one implementation per type property, including the default implementation.
   */
  readonly type?: string;

  /**
   * Callback that is invoked before an object is being created. If this returns `true`,
   * this object will be ignored.
   */
  ignore(map: TmxMapAsset, obj: O): boolean;

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
