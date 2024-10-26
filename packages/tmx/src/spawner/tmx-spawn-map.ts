import { Handle } from '@heliks/tiles-assets';
import { Entity } from '@heliks/tiles-engine';
import { TmxMapAsset } from '../parser';


/**
 * The current state of a {@link TmxMapAsset} that is spawned with a {@link TmxSpawnMap}
 * component attached to an entity.
 */
export enum TmxSpawnState {

  /** Map is not spawned into the world. */
  None,

  /** Map is currently in the process of being spawned into the world. */
  Spawning,

  /** Map is fully spawned into the world. */
  Spawned

}

/**
 * Component that can be attached to an entity to render a {@link TmxMapAsset}. All
 * entities that are created in the process to do so, will be attached to the owner
 * of this component as children. If the owner is destroyed, the entire map will be
 * un-loaded automatically.
 */
export class TmxSpawnMap {

  /**
   * Contains all layer root entities that were spawned by this map spawner. Each entity
   * is guaranteed to have a {@link TmxLayerRoot} component.
   */
  public readonly layers: Entity[] = [];

  /** Current state. */
  public state = TmxSpawnState.None;

  /**
   * @param handle Asset handle of the {@link TmxMapAsset} asset.
   */
  constructor(public handle?: Handle<TmxMapAsset>) {}

  /** Returns `true` if the map has been fully spawned into the world. */
  public isSpawned(): boolean {
    return this.state === TmxSpawnState.Spawned;
  }

}

