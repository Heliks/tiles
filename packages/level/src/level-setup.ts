import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Transform, World } from '@heliks/tiles-engine';
import { Renderer } from '@heliks/tiles-pixi';
import { Level } from './level';


@Injectable()
export class LevelSetup extends ReactiveSystem {

  constructor(public readonly renderer: Renderer) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(Level).contains(Transform).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const level = world.storage(Level).get(entity);

    if (level.bgColor !== undefined) {
      this.renderer.setBackgroundColor(level.bgColor);
    }
  }

  /** @inheritDoc */
  public onEntityRemoved(): void {
    return;
  }

}
