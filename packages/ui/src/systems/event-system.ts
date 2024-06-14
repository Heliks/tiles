import { Entity, Injectable, Parent, Query, QueryBuilder, ReactiveSystem, Storage, World } from '@heliks/tiles-engine';
import { UiEvent } from '../ui-event';
import { UiFocus } from '../ui-focus';
import { UiNode, UiNodeInteraction } from '../ui-node';


/** Handles UI events.*/
@Injectable()
export class EventSystem extends ReactiveSystem {

  /** @internal */
  private nodes!: Storage<UiNode>;

  /** @internal */
  private parents!: Storage<Parent>;

  /** @internal */
  private readonly queue: { [key: Entity]: UiNodeInteraction } = {};

  constructor(public readonly focus: UiFocus) {
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
  private pushInteractionEvent(entity: Entity, node: UiNode, event: UiEvent): void {
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

  public consume(entity: Entity): UiNodeInteraction {
    const event = this.queue[entity] ?? UiNodeInteraction.None;

    this.queue[entity] = UiNodeInteraction.None;

    return event;
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    // Reset the captured UI event.
    this.focus.captured = false;

    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      // If node is not interactive, skip processing the next step.
      if (! node.interactive) {
        continue;
      }

      const interaction = this.consume(entity);

      if (interaction !== UiNodeInteraction.None) {
        const event = new UiEvent(entity, interaction);

        this.pushInteractionEvent(entity, node, event);
      }
    }
  }

}
