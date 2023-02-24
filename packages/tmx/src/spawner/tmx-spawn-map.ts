import { TmxTilemap } from '../parser';
import { Handle } from '@heliks/tiles-assets';


/**
 * Component that can be attached to an entity to display a {@link TmxTilemap}.
 *
 * When the tilemap asset has finished loading, a hierarchy of entities is created to
 * compose the map. This hierarchy is always a child of the owner of this component.
 *
 * When the map is being reloaded (See: {@link dirty}), the entity hierarchy is destroyed
 * and recreated in the process. Therefore, the persistence of manually added or removed
 * components of entities in the hierarchy can not be guaranteed.
 */
export class TmxSpawnMap {

  /**
   * If set to `true`, the map will be reloaded. Deleting all child entities of the owner
   * of this component and re-creating the map scene.
   */
  public dirty = true;

  /**
   * @param handle Asset handle of the {@link TmxTilemap} asset.
   */
  constructor(public handle?: Handle<TmxTilemap>) {}

}

