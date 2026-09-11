import { AssetStorage } from '@heliks/tiles-assets';
import {
  EntitySerializer,
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
import { Camera, RendererConfig, SpriteRender } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { ChunkLoader } from './chunk-loader';
import { EntityMetadata } from './entity-metadata';
import { EntityLayerData, Layer, LayerType } from './layers';
import { Chunk, ChunkState, Level, LevelEventType } from './level';
import { LevelConfig } from './level-config';
import { LevelObject } from './objects';
import { ObjectsFactory } from './objects-factory';
import { getCellsFromDistance } from './utils';


/**
 * Token used by the service container to inject the {@link ObjectsFactory} that is
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
    public readonly factory: ObjectsFactory,
    public readonly assets: AssetStorage,
    public readonly camera: Camera,
    public readonly config: LevelConfig,
    public readonly hierarchy: Hierarchy,
    public readonly renderer: RendererConfig,
    public readonly entitySerializer: EntitySerializer,
    public readonly chunkLoader: ChunkLoader
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

      for (const chunk of level.loaded) {
        if (chunk.dirty) {
          this.chunkLoader.unload(world, level, chunk);

          void this.load(world, level, chunk);

          chunk.dirty = false;
        }
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
        this.chunkLoader.unload(world, level, chunk);
      }
    }
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

    for (const layer of level.layers) {
      const data = chunk.layers[layer.id];

      // Chunk may not own any data for this layer.
      if (! data) {
        continue;
      }

      const transform = new Transform(chunk.bounds.x, chunk.bounds.y);

      switch (layer.type) {
        case LayerType.Tiles:
          const tilemap = new Tilemap(chunk.grid, layer.renderTo);

          tilemap.setTilesets(level.tilesets);
          tilemap.setAll(data as number[]);

          world
            .create()
            .use(new Parent(chunk.entity))
            .use(tilemap)
            .use(transform)
            .build();
          break;
        case LayerType.Entities:
          this.createEntityLayerEntities(world, chunk, layer, data as any);
          break;
        case LayerType.Objects:
          promises.push(
            this.createObjectsLayerEntities(world, level, chunk, layer, data as LevelObject[])
          );

          break;
      }
    }

    await Promise.all(promises);

    chunk.state = ChunkState.Loaded;

    level.loaded.add(chunk);
    level.events.push({ type: LevelEventType.ChunkLoaded, chunk });
  }

  public createEntityLayerEntities(world: World, chunk: Chunk, layer: Layer, layerData: EntityLayerData): void {
    const sprites = world.storage(SpriteRender);
    const meta = world.storage(EntityMetadata);

    for (const data of layerData) {
      const entity = this.entitySerializer.deserialize(world, data);

      meta.set(entity, new EntityMetadata(layer.id));

      // If the entity has a sprite, force the level layers renderer layer.
      if (sprites.has(entity)) {
        sprites.get(entity).layer = layer.renderTo;
      }

      chunk.entities.push(entity);
    }
  }

  private async createObjectsLayerEntities(world: World, level: Level, chunk: Chunk, layer: Layer, data: LevelObject[]): Promise<void> {
    const promises = [];

    for (const item of data) {
      promises.push(this.factory.create(world, level, chunk, layer, item));
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
