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

  /**
   * References to script components are additionally stored here because we need
   * to call the `stop()` lifecycle on scripts when the component is removed from
   * an entity.
   *
   * @internal.
   */
  private readonly components = new Map<Entity, Script>();

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(Script).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const component = world.storage(Script).get(entity);

    this.components.set(entity, component);

    start(
      world,
      entity,
      component,
      component.script
    );
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const component = this.components.get(entity);

    if (! component) {
      return;
    }

    this.components.delete(entity);

    stop(world, entity, component);
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
