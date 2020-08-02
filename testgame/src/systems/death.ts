import { EntityQuery, Injectable, ProcessingSystem, World } from '@tiles/engine';
import { Health } from '../components/health';

/**
 * Handles death.
 */
@Injectable()
export class DeathSystem extends ProcessingSystem {

  constructor() {
    super();
  }

  /** @inheritDoc */
  public getQuery(): EntityQuery {
    return {
      contains: [
        Health
      ]
    };
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _health = world.storage(Health);

    for (const entity of this.group.entities) {
      const health = _health.get(entity);

      // If health is below 0, destroy the entity.
      if (health.current <= 0) {
        world.destroy(entity);
      }
    }
  }

}
