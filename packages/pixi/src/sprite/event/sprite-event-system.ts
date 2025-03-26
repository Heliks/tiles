import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Storage, World } from '@heliks/tiles-engine';
import { SpriteRender } from '../renderer';
import { SpriteEvent, SpriteEvents } from './sprite-event';


/**
 * Creates a callback function for the PIXI internal event emitter. The callback pushes
 * the given `event` type to the components event queue when it is invoked.
 *
 * @param component Component to which `event` should be pushed.
 * @param event Event type that is pushed to the `component` event queue.
 */
function createEventListener(component: SpriteEvent, event: SpriteEvents): Function {
  return function onSpriteEvent(): void {
    component._queue.push(event);
  }
}

export function process(events: SpriteEvent): void {
  if (events._queue.length === 0) {
    events.active = SpriteEvents.None;
  }

  let event;

  while (event = events._queue.pop()) {
    events.active = event;
  }
}

@Injectable()
export class SpriteEventSystem extends ReactiveSystem {

  /** @internal */
  private cmpSpriteDisplay!: Storage<SpriteRender>;

  /** @internal */
  private cmpSpriteEvent!: Storage<SpriteEvent>;

  constructor() {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(SpriteRender)
      .contains(SpriteEvent)
      .build();
  }

  /** @inheritDoc */
  public boot(world: World): void {
    super.boot(world);

    this.cmpSpriteDisplay = world.storage(SpriteRender);
    this.cmpSpriteEvent = world.storage(SpriteEvent);
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const sprite = this.cmpSpriteDisplay.get(entity)._sprite;
    const events = this.cmpSpriteEvent.get(entity);

    sprite.interactive = true;

    const onDown = createEventListener(events, SpriteEvents.Down);
    const onUp = createEventListener(events, SpriteEvents.Up);

    sprite
      .on('mousedown', onDown)
      .on('mouseup', onUp)
      .on('touchstart', onDown)
      .on('touchend', onUp);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    // Todo: Need to investigate if we still need to un-listen to events.
    this.cmpSpriteDisplay.get(entity)._sprite.interactive = false;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const store = world.storage(SpriteEvent);

    // Handle added or removed entities.
    super.update(world);

    for (const entity of this.query.entities) {
      process(
        store.get(entity)
      );
    }
  }

}
