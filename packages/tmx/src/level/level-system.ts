import { AssetStorage } from '@heliks/tiles-assets';
import {
  Hierarchy,
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
import { ChunkLayerType, ChunkState, Level } from './level';
import { LevelConfig } from './level-config';
import { getCellsFromDistance } from './utils';


@Injectable()
export class LevelSystem extends ProcessingSystem {

  /** @internal */
  private scratch1 = new Vec2();

  /** @internal */
  private scratch2 = [];

  constructor(
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

  /**
   * Unloads all chunks of a `level` that are outside the given unload `distance`.
   *
   * @param world Entity world.
   * @param level Level from which to unload chunks.
   * @param distance Distance after which loaded chunks will be culled.
   */
  public cull(world: World, level: Level, distance: number): void {
    // Get all chunks that are allowed to remain loaded. If a chunk is not part of
    // that result, it will be unloaded.
    const indexes = this.getChunksInRange(level, level.chunk, distance);

    for (const chunk of level.loaded) {
      if (indexes.includes(chunk.index)) {
        continue;
      }

      if (chunk.entity) {
        this.hierarchy.destroy(world, chunk.entity);
      }

      chunk.entity = undefined;
      chunk.state = ChunkState.Pending;

      level.loaded.delete(chunk);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const level = world.storage(Level).get(entity);

      // Width and height factors to translate tile sizes into world units.
      const cw = this.renderer.unitSize / level.grid.cellWidth;
      const ch = this.renderer.unitSize / level.grid.cellHeight;

      // Translate camera position to a grid position.
      level.chunk = level.layout.getIndexAt(
        this.camera.world.x * cw,
        this.camera.world.y * ch
      );

      if (level.chunk !== level._chunk) {
        this.cull(world, level, this.config.unloadDistance);

        const indexes = this.getChunksInRange(level, level.chunk, this.config.renderDistance);

        for (const index of indexes) {
          const chunk = level.getChunk(index);

          // Chunks are allowed to be left empty. If this is one of these cases, or
          // if the chunk is not unloaded, skip it entirely.
          if (! chunk || chunk.state !== ChunkState.Pending) {
            continue;
          }

          chunk.entity = world.insert();

          for (const layer of chunk.layers) {
            const transform = new Transform(
              chunk.x * (level.layout.cellWidth / cw),
              chunk.y * (level.layout.cellHeight / ch)
            );

            if (layer.type === ChunkLayerType.Tiles) {
              const tilemap = new Tilemap(chunk.grid, layer.layerId);

              tilemap.tilesets.copy(level.tilesets);
              tilemap.setAll(layer.data);

              world
                .create()
                .use(tilemap)
                .use(new Parent(chunk.entity))
                .use(transform)
                .build();
            }

            chunk.state = ChunkState.Loaded;
            level.loaded.add(chunk);

            console.log(chunk)
          }
        }

        level._chunk = level.chunk;
      }
    }
  }

}
