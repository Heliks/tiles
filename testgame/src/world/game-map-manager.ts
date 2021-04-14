import { TmxMap } from '@heliks/tiles-tmx';
import { Injectable, World } from '@heliks/tiles-engine';
import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import { GameWorld } from './game-world';
import { WorldChunk, WorldChunkState } from './world-chunk';
import { MapSpawner } from './map-spawner';

/** Manages the various map assets that make up the game world. */
@Injectable()
export class GameMapManager {

  /**
   * The amount of units that should be looked ahead to detect maps that are in range
   * of the camera. The values here go in both directions, which means that a range
   * of `5` on the x axis will detect maps 5 units ahead to the right and to the left,
   * which results in an effective range of `10` units.
   */
  public readonly range = 5;

  /** The world that is currently active. */
  public world?: GameWorld;

  /** Storage for loaded map assets. */
  private readonly assets: AssetStorage<TmxMap> = new Map();

  /** Contains all chunks that are currently spawned to the world. */
  private readonly chunks: WorldChunk[] = [];

  /** @internal */
  private readonly _chunks: WorldChunk[] = [];

  /** Contains the Ids of active chunks that are marked for removal. */
  private readonly removals = new Set<number>();

  /**
   * @param loader {@see AssetLoader}
   */
  constructor(
    private readonly loader: AssetLoader,
    private readonly spawner: MapSpawner
  ) {}

  /**
   * Updates the active game `world`. If a previous world was set, all maps of that
   * world that are currently loaded will be unloaded.
   */
  public setWorld(world: GameWorld): void {
    this.world = world;
  }

  /** De-spawns all active chunks that are marked for removal. */
  private despawn(world: World): void {
    for (const active of this.chunks) {
      if (!this.removals.has(active.id)) {
        active.despawn(world);
      }
    }

    this.removals.clear();
  }

  public update(world: World, x: number, y: number): void {
    if (this.world) {
      const chunks = this._chunks;

      this.world.getChunksInRange(x, y, this.range, chunks);

      for (const chunk of chunks) {
        this.removals.add(chunk.id);

        // Load chunks that are pending and spawn chunks that have finished loading.
        if (chunk.isPending()) {
          chunk.load(this.loader, this.assets);
        }
        else if (chunk.state !== WorldChunkState.Active) {
          const asset = chunk.getAsset(this.assets);

          if (asset) {
            chunk.spawn(world, this.assets, this.spawner);

            this.chunks.push(chunk);
          }
        }
      }

      this.despawn(world);

      // Replace the active chunk information.
      this.chunks.length = 0;
      this.chunks.push(...chunks);

      chunks.length = 0;
    }
  }

}
