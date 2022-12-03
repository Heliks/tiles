import { Entity, ProcessingSystem, Query, QueryBuilder, Storage, World } from '@heliks/tiles-engine';
import { Interaction, UiRoot } from './ui-root';


/** @internal */
function setValue(world: World, node: UiRoot, interaction: Interaction): void {
  if (node.interaction !== interaction) {
    node.interaction = interaction;
    node.interact?.(world, interaction);
  }
}


/**
 * Manages user interactions with UI elements.
 */
export class ProcessInteractions extends ProcessingSystem {

  /** Contains all entities that were recently clicked. */
  private readonly clicked = new Set<Entity>();

  /** Storage for {@link UiRoot} components. */
  private roots!: Storage<UiRoot>;

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(UiRoot)
      .build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.roots = world.storage(UiRoot);
  }

  /** @internal */
  private setupViewInteraction(entity: Entity, root: UiRoot): void {
    root.container.interactive = true;
    root.container.on('pointerdown', () => {
      this.clicked.add(entity);
    });
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const root = this.roots.get(entity);

      if (root.interactive) {
        // Register interactions if necessary.
        if (! root.container.interactive) {
          this.setupViewInteraction(entity, root);
        }

        // Check for clicks.
        if (this.clicked.has(entity)) {
          setValue(world, root, Interaction.Clicked);

          continue;
        }
      }

      setValue(world, root, Interaction.None);
    }

    this.clicked.clear();
  }

}
