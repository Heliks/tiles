import { Handle } from '@heliks/tiles-assets';
import { Entity } from '@heliks/tiles-engine';
import { TmxMapAsset } from '../parser';


/**
 * Component that can be attached to an entity to display a {@link TmxMapAsset}.
 *
 * When the tilemap asset has finished loading, a hierarchy of entities is created to
 * compose the map. This hierarchy is always a child of the owner of this component.
 *
 * When the map is being reloaded (See: {@link dirty}), the entity hierarchy is destroyed
 * and recreated in the process. Therefore, the persistence of manually added or removed
 * components of entities in the hierarchy can not be guaranteed.
 */
export class TmxSpawnMap {

  /** If set to `true`, the map will be re-created on the next frame. */
  public dirty = true;

  /**
   * Contains all layer root entities that were spawned by this map spawner. Each entity
   * is guaranteed to have a {@link TmxLayerRoot} component.
   */
  public readonly layers: Entity[] = [];

  /**
   * @param handle Asset handle of the {@link TmxMapAsset} asset.
   */
  constructor(public handle?: Handle<TmxMapAsset>) {}

}

