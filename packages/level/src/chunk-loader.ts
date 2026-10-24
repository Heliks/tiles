import { EntitySerializer, Hierarchy, Injectable, World } from '@heliks/tiles-engine';
import { EntityMetadata } from './entity-metadata';
import { EntityLayerData, LayerType } from './layers';
import { Chunk, ChunkState, Level, LevelEventType } from './level';


/**
 * Persists runtime chunk state when a chunk is unloaded by the level system by writing
 * it back into the levels' data.
 */
@Injectable()
export class ChunkLoader {

  private readonly _scratch = new Map<number, EntityLayerData>();

  constructor(
    public readonly hierarchy: Hierarchy,
    public readonly serializer: EntitySerializer
  ) {}

  /**
   * Unloads a chunk from the given `level`.
   *
   * @remarks
   * The chunk must be {@link ChunkState.Loaded}. Otherwise, there might be race
   * conditions that cause the chunk to not unload fully.
   *
   * @param world The world that owns the chunk entities and resources.
   * @param level Level that owns the chunk that is being unloaded.
   * @param chunk The chunk to unload
   */
  public unload(world: World, level: Level, chunk: Chunk): void {
    this.save(world, level, chunk);

    if (chunk.entity) {
      this.hierarchy.destroy(world, chunk.entity);
    }

    for (const entity of chunk.entities) {
      world.destroy(entity);
    }

    chunk.entity = undefined;
    chunk.entities.length = 0;
    chunk.state = ChunkState.Pending;

    level.loaded.delete(chunk);
    level.events.push({ type: LevelEventType.ChunkUnloaded, chunk });
  }

  /**
   * Persists the current state of the given `chunk`.
   *
   * The state can only be saved if the chunk is loaded. Otherwise, its state would be
   * empty. Most commonly, this function is used before a chunk is being unloaded by
   * the level system.
   *
   * @param world The world that owns the chunk entities and resources.
   * @param level The level that owns the chunk.
   * @param chunk The chunk to persist
   */
  public save(world: World, level: Level, chunk: Chunk): void {
    if (! level.loaded.has(chunk)) {
      return;
    }

    const store = world.storage(EntityMetadata);

    this._scratch.clear();

    // This function is called when a chunk unloads, so it must be performant. To
    // avoid redundant loops, we allocate the layer data first.
    for (const layer of level.layers) {
      if (layer.type === LayerType.Entities) {
        this._scratch.set(layer.id, []);
      }
    }

    for (const entity of chunk.entities) {
      if (! store.has(entity)) {
        continue;
      }

      const meta = store.get(entity);
      const data = this._scratch.get(meta.layerId);

      if (data) {
        data.push(this.serializer.serialize(world, entity));
      }
    }

    // Write data back to layers.
    for (const layer of level.layers) {
      const data = this._scratch.get(layer.id);

      if (data) {
        chunk.layers[layer.id] = data;
      }
    }
  }

}
