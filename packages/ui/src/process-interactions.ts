import { Graphics } from 'pixi.js';
import { Entity, ProcessingSystem, Query, QueryBuilder, Rectangle, Storage, World } from '@heliks/tiles-engine';
import { Interaction, UiNode } from './ui-node';


/**
 * Manages user interactions with UI elements.
 */
export class ProcessInteractions extends ProcessingSystem {

  /** Contains all entities that were recently clicked. */
  private readonly clicked = new Set<Entity>();

  /** Storage for {@link UiNode} components. */
  private nodes!: Storage<UiNode>;

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(UiNode).build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.nodes = world.storage(UiNode);
  }

  /** @internal */
  private setupViewInteraction(entity: Entity, node: UiNode): void {
    node.widget.view.interactive = true;

    // Graphics need to have their hit area manually set.
    if (node.widget.view instanceof Graphics) {
      node.widget.view.hitArea = new Rectangle(node.width, node.height, 0, 0);
    }

    node.widget.view.on('pointerdown', () => {
      this.clicked.add(entity);
    });
  }

  /** @inheritDoc */
  public update(): void {
    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      if (node.interactive) {
        const view = node.widget.view;

        // Register interaction if necessary.
        if (! view.interactive) {
          this.setupViewInteraction(entity, node);
        }

        // Check for clicks.
        if (this.clicked.has(entity)) {
          node.interaction = Interaction.Clicked;

          continue;
        }
      }

      node.interaction = Interaction.None;
    }

    this.clicked.clear();
  }

}
