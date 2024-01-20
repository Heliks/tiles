import { Entity, Parent, ProcessingSystem, Query, QueryBuilder, Storage, World } from '@heliks/tiles-engine';
import { UiNode, UiNodeInteraction } from '../ui-node';
import { UiEvent } from '../ui-event';


/**
 * Processes user interaction events (mouse, touch, etc) of {@link UiNode UI nodes}.
 *
 * @see UiNode.interaction
 */
export class EventSystem extends ProcessingSystem {

  /**
   * Keeps track of entities on which the pointer is pressing down on.
   *
   * @internal
   */
  private readonly _down = new Set<Entity>();

  /**
   * Storage for {@link UiNode} components.
   *
   * @internal
   */
  private nodes!: Storage<UiNode>;

  /**
   * Storage for {@link UiNode} components.
   *
   * @internal
   */
  private parents!: Storage<Parent>;

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(UiNode).build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.nodes = world.storage(UiNode);
    this.parents = world.storage(Parent);
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

  /** @internal */
  private setInteraction(target: Entity, node: UiNode, interaction: UiNodeInteraction): void {
    if (interaction !== node.interaction) {
      node.interaction = interaction;

      const event = new UiEvent(target, interaction);

      this.pushInteractionEvent(target, node, event);
    }
  }

  /**
   * Sets the {@link UiNode node} of `target` as "{@link UiNodeInteraction.Down down}". The
   * change requires a frame tick before it takes effect.
   */
  public down(target: Entity): this {
    this._down.add(target);

    return this;
  }

  /**
   * Sets the {@link UiNode node} of `target` as {@link UiNodeInteraction.Up up}. This only
   * works if the entity was {@link UiNodeInteraction.Down down} before. The change requires
   * a frame tick before it takes effect.
   */
  public up(target: Entity): this {
    this._down.delete(target);

    return this;
  }

  /** @internal */
  private setupViewInteraction(entity: Entity, root: UiNode): void {
    root.container.interactive = true;

    root.container.on('pointerdown', () => {
      this.down(entity);
    });

    root.container.on('pointerup', () => {
      this.up(entity);
    });
  }

  /** @inheritDoc */
  public update(): void {
    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      // If node is not interactive, skip processing entirely.
      if (! node.interactive) {
        continue;
      }

      // Make PIXI view interactive if necessary.
      if (! node.container.interactive) {
        this.setupViewInteraction(entity, node);
      }

      if (this._down.has(entity)) {
        this.setInteraction(entity, node, UiNodeInteraction.Down);

        continue;
      }

      // When node is not pressed, but still has the interaction, the press was released
      // on this frame.
      if (node.interaction === UiNodeInteraction.Down) {
        this.setInteraction(entity, node, UiNodeInteraction.Up);

        continue;
      }

      this.setInteraction(entity, node, UiNodeInteraction.None);
    }
  }

}