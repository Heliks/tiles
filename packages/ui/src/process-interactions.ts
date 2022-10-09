import { Graphics } from 'pixi.js';
import { Entity, ProcessingSystem, Query, QueryBuilder, Rectangle, Storage, World } from '@heliks/tiles-engine';
import { Interaction, Widget } from './widget';


/**
 * Manages user interactions with UI elements.
 */
export class ProcessInteractions extends ProcessingSystem {

  /** Contains all entities that were recently clicked. */
  private readonly clicked = new Set<Entity>();

  /** Storage for {@link Widget} components. */
  private widgets!: Storage<Widget>;

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(Widget).build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.widgets = world.storage(Widget);
  }

  /** @internal */
  private setupViewInteraction(entity: Entity, widget: Widget): void {
    widget.widget.view.interactive = true;

    // Graphics need to have their hit area manually set.
    if (widget.widget.view instanceof Graphics) {
      widget.widget.view.hitArea = new Rectangle(widget.width, widget.height, 0, 0);
    }

    widget.widget.view.on('pointerdown', () => {
      this.clicked.add(entity);
    });
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const widget = this.widgets.get(entity);

      if (widget.interactive) {
        const view = widget.widget.view;

        // Register interaction if necessary.
        if (! view.interactive) {
          this.setupViewInteraction(entity, widget);
        }

        // Check for clicks.
        if (this.clicked.has(entity)) {
          widget.interaction = Interaction.Clicked;

          continue;
        }
      }

      widget.interaction = Interaction.None;
    }

    this.clicked.clear();
  }

}
