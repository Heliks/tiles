import { Injectable, Subscriber, System, World } from '@heliks/tiles-engine';
import { ContactEvent, ContactEvents } from '@heliks/tiles-physics';
import { Health } from '../components/health';

@Injectable()
export class ArrowSystem implements System {

  protected readonly event$: Subscriber;

  constructor(protected readonly onContact: ContactEvents) {
    // Subscribe to the event queue.
    this.event$ = onContact.subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _health = world.storage(Health);

    for (const event of this.onContact.read(this.event$)) {
      if (event.bodyA.hasTag('arrow') && event.type === ContactEvent.Begin) {
        // De-spawn the arrow
        world.destroy(event.entityA);

        // Check if the entity we hit had any health, and if yes reduce it accordingly.
        if (_health.has(event.entityB)) {
          const health = _health.get(event.entityB);

          health.current -= 10;

          console.log(`Damage on #${event.entityB}. HP: ${health.current}/${health.total}`);
        }
      }
    }
  }

}
