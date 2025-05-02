import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, World } from '@heliks/tiles-engine';
import { Script } from './script';
import { start, stop } from './setup';


/**
 * Manages the execution of {@link Script} components.
 *
 * @see Script
 */
@Injectable()
export class ScriptSystem extends ReactiveSystem {

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(Script).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const component = world.storage(Script).get(entity);

    start(
      world,
      entity,
      component,
      component.script
    );
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    stop(world, entity, world.storage(Script).get(entity));
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    const store = world.storage(Script);

    for (const entity of this.query.entities) {
      const component = store.get(entity);

      if (! component.enabled) {
        continue;
      }

      // Script behavior has changed.
      if (component.script !== component._running) {
        start(
          world,
          entity,
          component,
          component.script
        );
      }

      component._running.update(world, entity);
    }
  }
}
