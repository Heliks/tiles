import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Camera } from '@heliks/tiles-pixi';
import { Level } from './level';
import { LevelConfig } from './level-config';
import { getCellsFromDistance } from './utils';


@Injectable()
export class LevelSystem extends ReactiveSystem {

  constructor(
    public readonly assets: AssetStorage,
    public readonly camera: Camera,
    public readonly config: LevelConfig
  ) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(Level).contains(Transform).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {

  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {

  }

  private scratch1 = new Vec2();
  private scratch2 = [];

  public getVisibleChunks(level: Level, origin: number): readonly number[] {
    const location = level.layout.getLocation(origin, this.scratch1);

    return getCellsFromDistance(
      level.layout,
      location.x,
      location.y,
      this.config.distance,
      this.scratch2
    );
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const level = world.storage(Level).get(entity);

      level.chunk = level.layout.getIndex(
        this.camera.world.x,
        this.camera.world.y
      );

      if (level.chunk !== level._chunk) {
        const indexes = this.getVisibleChunks(level, level.chunk);

        for (const index of indexes) {
          let chunk = level.getChunk(index);


          console.log(chunk);

          // const data = asset.getChunkAt();
        }

        level._chunk = level.chunk;
      }
    }
  }

}
