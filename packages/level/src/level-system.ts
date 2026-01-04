import { AssetStorage } from '@heliks/tiles-assets';
import {
  Hierarchy,
  Inject,
  Injectable,
  Parent,
  ProcessingSystem,
  Query,
  QueryBuilder,
  Transform,
  Vec2,
  World
} from '@heliks/tiles-engine';
import { Camera, RendererConfig } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { EntityFactory } from './entity-factory';
import { Chunk, ChunkEntityLayer, ChunkLayerType, ChunkState, Level } from './level';
import { LevelConfig } from './level-config';
import { getCellsFromDistance } from './utils';


/**
 * Token used by the service container to inject the {@link EntityFactory} that is
 * used by the level system.
 */
export const LEVEL_ENTITY_FACTORY = Symbol('LEVEL_ENTITY_FACTORY');

@Injectable()
export class LevelSystem extends ProcessingSystem {

  /** @internal */
  private scratch1 = new Vec2();

  /** @internal */
  private scratch2 = [];

  constructor(
    @Inject(LEVEL_ENTITY_FACTORY)
    public readonly factory: EntityFactory,
    public readonly assets: AssetStorage,
    public readonly camera: Camera,
    public readonly config: LevelConfig,
    public readonly hierarchy: Hierarchy,
    public readonly renderer: RendererConfig
  ) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(Level).contains(Transform).build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const level = world.storage(Level).get(entity);

      // Translate camera position to a grid position.
      level.chunk = level.layout.getIndexAt(
        this.camera.world.x,
        this.camera.world.y
      );

      if (level.chunk !== level._chunk) {
        this.cull(world, level);

        const indexes = this.getChunksInRange(level, level.chunk, this.config.renderDistance);

        for (const index of indexes) {
          const chunk = level.getChunk(index);

          if (chunk && chunk.state === ChunkState.Pending) {
            void this.load(world, level, chunk);
          }
        }

        level._chunk = level.chunk;
      }
    }
  }

  /**
   * Unloads all chunks of a `level` that are outside the given unload `distance`.
   *
   * @param world Entity world
   * @param level Level from which to unload chunks
   */
  public cull(world: World, level: Level): void {
    // Get all chunks that are allowed to remain loaded. If a chunk is not part of
    // that result, it will be unloaded.
    const indexes = this.getChunksInRange(level, level.chunk, this.config.unloadDistance);

    for (const chunk of level.loaded) {
      // Chunks that are partially loaded can't be unloaded. Skip them for now. We could
      // optimize this later by canceling the loading process, but this is fine for now.
      if (! indexes.includes(chunk.index) && chunk.state === ChunkState.Loaded) {
        this.unload(world, level, chunk);
      }
    }
  }

  /**
   * Unloads a chunk from the given `level`.
   *
   * @remarks
   * The chunk must be {@link ChunkState.Loaded}. Otherwise, there might be race
   * conditions that cause the chunk to not unload fully.
   *
   * @param world Entity world
   * @param level Level from where chunk is unloaded
   * @param chunk The chunk to unload
   */
  public unload(world: World, level: Level, chunk: Chunk): void {
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
  }

  /**
   * Loads a chunk on the given level.
   *
   * @remarks
   * The chunk must be {@link ChunkState.Pending} before it is loaded. Otherwise,
   * previous artifacts of the chunk might not unload properly.
   *
   * @param world Entity world
   * @param level Level that loads the chunk
   * @param chunk The chunk to load
   */
  public async load(world: World, level: Level, chunk: Chunk): Promise<void> {
    if (chunk.state !== ChunkState.Pending) {
      throw new Error(`Chunk ${chunk.index} is already loaded.`);
    }

    chunk.entity = world.insert();
    chunk.state = ChunkState.Loading;

    // Entity layers are created async.
    const promises = [];

    for (const layer of chunk.layers) {
      const transform = new Transform(
        chunk.bounds.x,
        chunk.bounds.y
      );

      switch (layer.type) {
        case ChunkLayerType.Tiles:
          const tilemap = new Tilemap(chunk.grid, layer.props.$layer);

          tilemap.setTilesets(level.tilesets);
          tilemap.setAll(layer.data);

          world
            .create()
            .use(new Parent(chunk.entity))
            .use(tilemap)
            .use(transform)
            .build();

          break;
        case ChunkLayerType.Entities:
          promises.push(
            this.spawnEntityLayer(world, level, chunk, layer)
          );

          break;
      }
    }

    await Promise.all(promises);

    chunk.state = ChunkState.Loaded;
    level.loaded.add(chunk);
  }

  private async spawnEntityLayer(world: World, level: Level, chunk: Chunk, layer: ChunkEntityLayer): Promise<void> {
    const promises = [];

    for (const data of layer.data) {
      promises.push(this.factory.create(world, level, chunk, layer, data));
    }

    chunk.entities.push(...await Promise.all(promises));
  }

  /**
   * This method returns a scratch, which means that the returned array will be
   * invalidated and populated with the next result when this function is called.
   */
  private getChunksInRange(level: Level, origin: number, distance: number): readonly number[] {
    this.scratch2.length = 0;

    const location = level.layout.getLocation(origin, this.scratch1);

    return getCellsFromDistance(
      level.layout,
      location.x,
      location.y,
      distance,
      this.scratch2
    );
  }

}
