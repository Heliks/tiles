import { TmxMap, TmxTilemapFormat } from '@heliks/tiles-tmx';
import { Asset, AssetLoader, AssetStorage, Handle } from '@heliks/tiles-assets';
import { GameMap } from './game-map';
import { World } from '@heliks/tiles-engine';
import { MapSpawner } from './map-spawner';

export enum ChunkState {
  /** No data is loaded and no data is being loaded right now. */
  Pending,
  /** Data is loading. */
  Loading,
  /** Data is loaded. Chunk can be spawned into the world. */
  Loaded,
  /** Data is loaded and chunk is currently spawned as a map into the world. */
  Active
}

/**
 * A chunk of the game world. Each chunk contains a map (or the part of a complete map)
 * and the information where it is located in the world.
 */
export class Chunk {

  /** Contains the spawned game map if the chunk is active. */
  private map?: GameMap;

  /** @internal */
  private _state = ChunkState.Pending;

  /** Current state. */
  public get state(): ChunkState {
    return this._state;
  }

  /** Handle that points to the loaded game map asset. */
  public handle?: Handle<TmxMap>;

  /**
   * @param id Id of the chunk.
   * @param file Filename of the map asset that should be loaded into this chunk.
   * @param width Width in game units.
   * @param height Height in game units.
   * @param x Position on x axis where map should be placed in the world in game units.
   * @param y Position on y axis where map should be placed in the world in game units.
   */
  constructor(
    public readonly id: number,
    public readonly file: string,
    public readonly width: number,
    public readonly height: number,
    public readonly x = 0,
    public readonly y = 0
  ) {}

  /** Returns `true` if the chunk is pending. */
  public isPending(): boolean {
    return this._state === ChunkState.Pending;
  }

  /** Returns `true` if the chunk is currently loading. */
  public isLoading(): boolean {
    return this._state === ChunkState.Loading;
  }

  /** If a map asset for this chunk was loaded into `storage`, it will be returned. */
  public getAsset(storage: AssetStorage<TmxMap>): Asset<TmxMap> | undefined {
    // We can avoid the extra if statement here because if the handle itself is
    // undefined it couldn't possibly match a false positive as the storage only
    // contains Handle<GameMap> keys.
    return storage.get(this.handle!);
  }

  /**
   * Loads the map asset of this chunk using `loader` and returns a `Handle<TmxMap>`.
   * This automatically updates the chunk state to `Loading`. If the asset is already
   * being loaded the existing handle will be returned instead of loading the asset
   * a second time.
   */
  public load(loader: AssetLoader, storage: AssetStorage<TmxMap>): Handle<TmxMap> {
    if (this.handle) {
      return this.handle;
    }

    this._state = ChunkState.Loading;

    return this.handle = loader.load(this.file, new TmxTilemapFormat(), storage);
  }

  /**
   * Spawns the chunk into the world. This automatically sets the chunk state
   * to `Active`. This assumes that the asset for this chunk is already loaded. Not
   * checking this before calling this method can lead to undefined behavior.
   */
  public spawn(world: World, storage: AssetStorage<TmxMap>, spawner: MapSpawner): void {
    this.map = spawner.spawn(
      world,
      this.getAsset(storage)!.data,
      this.x,
      this.y
    );

    this._state = ChunkState.Active;
  }

  /** De-spawns the chunk from the world. */
  public despawn(world: World): boolean {
    if (this.map) {
      for (const entity of this.map.entities) {
        world.destroy(entity);
      }

      // Map no longer holds any entities.
      this.map.entities.length = 0;
      this.map = undefined;

      // Chunk map is no longer active but is still ready to be spawned again, so we
      // can revert the state back to loaded.
      this._state = ChunkState.Loaded;

      return true;
    }

    return false;
  }


}
