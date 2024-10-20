import { Entity, World } from '@heliks/tiles-engine';
import { TmxMapAsset, TmxObject, TmxObjectLayer } from '../../parser';


/** Transforms a specific type of {@link TmxObject} into an entity. */
export interface TmxObjectFactory {

  /**
   * The factory transforms {@link TmxObject map objects} that match this type. If this
   * is `undefined`, this factory is supposed to be used when an object either does not
   * specify a `type` at all, or if there is no implementation of the type that it uses.
   *
   * Note: In the Tiled editor, this is called "class" in later versions.
   */
  readonly type?: string;

  /**
   * Implementation of the logic that transforms the given `obj` into an entity. This
   * can be async, to allow lazy loading logic for custom object types.
   *
   * @param world Entity world.
   * @param map The map asset on which the object exists.
   * @param layer The map layer on which the object exists.
   * @param obj The object that is to be transformed into an entity.
   */
  create(world: World, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): Entity | Promise<Entity>;

}
