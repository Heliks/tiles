import {
  Entity,
  Injectable,
  Parent,
  Query,
  QueryBuilder,
  ReactiveSystem,
  Storage,
  Ticker,
  World
} from '@heliks/tiles-engine';
import { UiEvent } from '../ui-event';
import { UiFocus } from '../ui-focus';
import { UiNode, UiNodeInteraction } from '../ui-node';


export interface LongPressTimer {
  origin: Entity;
  timer: number;
}

/** Handles UI events.*/
@Injectable()
export class EventSystem extends ReactiveSystem {

  /**
   * Contains the active long-press timer, if any.
   */
  public longPress?: LongPressTimer;

  /**
   * Time in MS that the user needs to press down until a {@link UiEvent} with a
   * {@link UiNodeInteraction.LongPress} interaction will be triggered on the origin
   * of the active {@link longPress}.
   */
  public longPressTimeMs = 500;

  /** @internal */
  private nodes!: Storage<UiNode>;

  /** @internal */
  private parents!: Storage<Parent>;

  /** @internal */
  private readonly queue: { [key: Entity]: UiNodeInteraction } = {};

  constructor(public readonly focus: UiFocus, public readonly ticker: Ticker) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(UiNode).build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.nodes = world.storage(UiNode);
    this.parents = world.storage(Parent);
  }

  private capture(): void {
    this.focus.captured = true;
  }

  /** @internal */
  public pushInteractionEvent(entity: Entity, node: UiNode, event: UiEvent): void {
    node.onInteract.push(event);

    // Bubble events.
    if (this.parents.has(entity)) {
      const parent = this.parents.get(entity).entity;

      if (this.nodes.has(parent)) {
        return this.pushInteractionEvent(parent, this.nodes.get(parent), event);
      }
    }
  }

  /** Queues a {@link UiNodeInteraction.Down} interaction on the given `target` entity. */
  public down(target: Entity): this {
    this.queue[target] = UiNodeInteraction.Down

    return this;
  }

  /** Queues a {@link UiNodeInteraction.Up} interaction on the given `target` entity. */
  public up(target: Entity): this {
    this.queue[target] = UiNodeInteraction.Up

    return this;
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const node = this.nodes.get(entity);

    // Event for UiFocus capture. This will be registered even if the node is not
    // interactive. Todo: Add a flag to control this behavior for transient nodes?
    node.container.on('pointerdown', this.capture.bind(this));

    // All nodes need to be made interactive for UiFocus capture.
    node.container.interactive = true;

    if (node.interactive) {
      node.container
        .on('pointerdown', () => this.down(entity))
        .on('pointerup', () => this.up(entity));
    }
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.nodes.get(entity).container.removeAllListeners();
  }

  /**
   * Returns the next queued {@link UiNodeInteraction} for the {@link UiNode} of the
   * given `entity`, or {@link UiNodeInteraction.None} if no interaction is queued.
   *
   * This removes the interaction from the {@link queue}.
   *
   * When the queued interaction is a {@link UiNodeInteraction.Down}, a {@link longPress}
   * timer will be triggered. Consuming a {@link UiNodeInteraction.Down} interaction will
   * cancel any active long-press timer.
   */
  public consumeQueuedInteraction(entity: Entity): UiNodeInteraction {
    const event = this.queue[entity] ?? UiNodeInteraction.None;

    this.queue[entity] = UiNodeInteraction.None;

    switch (event) {
      case UiNodeInteraction.Up:
        this.longPress = undefined;
        break;
      case UiNodeInteraction.Down:
        this.longPress = {
          origin: entity,
          timer: 0
        };
        break;
    }

    return event;
  }

  /**
   * Updates the active {@link longPress} timer, if any.
   *
   * Might trigger a {@link UiEvent} with a {@link UiNodeInteraction.LongPress} interaction
   * on the timers origin if it has exceeded the {@link longPressTimeMs} limit.
   */
  public updateLongPress(): void {
    if (this.longPress) {
      this.longPress.timer += this.ticker.delta;

      if (this.longPress.timer >= this.longPressTimeMs) {
        this.pushInteractionEvent(
          this.longPress.origin,
          this.nodes.get(this.longPress.origin),
          new UiEvent(this.longPress.origin, UiNodeInteraction.LongPress)
        )

        this.longPress = undefined;
      }
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    // Reset the captured UI event.
    this.focus.captured = false;

    this.updateLongPress();

    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      // If node is not interactive, skip processing the next step.
      if (! node.interactive) {
        continue;
      }

      const interaction = this.consumeQueuedInteraction(entity);

      if (interaction !== UiNodeInteraction.None) {
        this.pushInteractionEvent(entity, node, new UiEvent(entity, interaction));
      }
    }
  }

}
