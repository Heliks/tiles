import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Transform, World } from '@heliks/tiles-engine';
import { Renderer } from '@heliks/tiles-pixi';
import { ChunkLoader } from './chunk-loader';
import { Level } from './level';


/**
 * Handles setup and destruction logic for {@link Level levels}.
 *
 * When a level is removed from the world, all {@link Chunk chunks} that remain loaded
 * will be unloaded.
 */
@Injectable()
export class LevelSetup extends ReactiveSystem {

  /** @internal */
  private readonly levels = new Map<Entity, Level>();

  constructor(public readonly chunks: ChunkLoader, public readonly renderer: Renderer) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(Level).contains(Transform).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const level = world.storage(Level).get(entity);

    this.levels.set(entity, level);

    if (level.bgColor !== undefined) {
      this.renderer.setBackgroundColor(level.bgColor);
    }
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const level = this.levels.get(entity);

    if (! level) {
      return;
    }

    // Unload every chunk that is still loaded.
    for (const chunk of level.loaded) {
      this.chunks.unload(world, level, chunk);
    }

    // Clear the cached chunk indices. If this level component is attached again
    // while the camera remains in the same chunk, the level system will not load
    // chunks otherwise.
    level.chunk = -1;
    level._chunk = -1;

    // Remove reference.
    this.levels.delete(entity);
  }

}
