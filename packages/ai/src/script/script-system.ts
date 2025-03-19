import {
  ComponentEvent,
  Entity,
  Injectable,
  Query,
  QueryBuilder,
  ReactiveSystem,
  Subscriber,
  World
} from '@heliks/tiles-engine';
import { Script } from './script';


/**
 * Manages the execution of {@link Script} components.
 *
 * @see Script
 */
@Injectable()
export class ScriptSystem extends ReactiveSystem {

  /** @internal */
  private events!: Subscriber<ComponentEvent<Script>>;

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(Script).build();
  }

  /** @inheritDoc */
  public boot(world: World): void {
    this.events = world.storage(Script).events.subscribe();

    super.boot(world);
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const component = world.storage(Script).get(entity);

    component.start(
      world,
      entity,
      component.script
    );
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    // Invoke stop callback on running script.
    world.storage(Script).get(entity).stop(world, entity);
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    const store = world.storage(Script);

    for (const entity of this.query.entities) {
      const component = store.get(entity);

      // Script behavior has changed.
      if (component.script !== component._running) {
        component.start(
          world,
          entity,
          component.script
        );
      }

      component._running.update(world, entity);
    }
  }
}
