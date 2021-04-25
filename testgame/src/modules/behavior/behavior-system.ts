import { contains, Injectable, ProcessingSystem, World } from '@heliks/tiles-engine';
import { BehaviorManager } from './behavior-manager';
import { Behavior } from './behavior';

/** Executes entity behaviors. */
@Injectable()
export class BehaviorSystem extends ProcessingSystem {

  /**
   * @param behaviorManager [[behaviorManager]]
   */
  constructor(private readonly behaviorManager: BehaviorManager) {
    super(contains(Behavior));
  }

  /** Executes each entity `Behavior` once. */
  public update(world: World): void {
    const behaviors = world.storage(Behavior);

    for (const entity of this.group.entities) {
      const behavior = behaviors.get(entity);
      const script = this.behaviorManager.get(behavior.id);

      if (script) {
        script.update(entity, behavior, world);
      }
    }
  }

}
