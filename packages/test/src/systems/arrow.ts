import { System } from "@tiles/entity-system";
import { EventQueue, Subscriber, World } from "@tiles/engine";
import { Injectable } from "@tiles/injector";
import { ContactEvent, PhysicsWorld } from "@tiles/physics";
import { Health } from "../components/health";

@Injectable()
export class ArrowSystem implements System {

  protected events: EventQueue<ContactEvent>;
  protected event$: Subscriber;

  constructor(protected readonly pWorld: PhysicsWorld) {
    // Get the event queue for all rigid bodies that are tagged as "arrow".
    this.events = pWorld.events([
      'arrow'
    ]);

    // Subscribe to the event queue.
    this.event$ = this.events.subscribe();
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const _health = world.storage(Health);

    for (const event of this.events.read(this.event$)) {
      // De-spawn the arrow
      world.destroy(event.entityA);

      // Check if the entity we hit had any health, and if yes reduce
      // it accordingly.
      if (_health.has(event.entityB)) {
        const health = _health.get(event.entityB);

        health.current -= 10;

        console.log(`Damge on #${event.entityB}. HP: ${health.current}/${health.total}`);
      }
    }
  }

}
