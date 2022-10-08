import {
  ComponentEventType,
  Entity,
  Hierarchy,
  Injectable,
  OnInit,
  Parent,
  Query,
  Storage,
  Subscriber, Vec2,
  World
} from '@heliks/tiles-engine';
import { alignTo, Camera, RendererPlugin, Screen, Stage } from '@heliks/tiles-pixi';
import { AlignWidget, Widget } from './widget';


/**
 * Plugin for the PIXI.js renderer that draws {@link Widget} components to the
 * renderer stage.
 */
@Injectable()
export class DrawUi implements OnInit, RendererPlugin {

  /** @internal */
  private parents!: Storage<Parent>;
  private widgets!: Storage<Widget>;
  private subscription!: Subscriber;
  private query!: Query;

  /** @internal */
  private _scratch = new Vec2();

  constructor(
    private readonly camera: Camera,
    private readonly hierarchy: Hierarchy,
    private readonly stage: Stage,
    private readonly screen: Screen
  ) {}

  /** @inheritDoc */
  public onInit(world: World): void {
    this.query = world
      .query()
      .contains(Widget)
      .build();

    this.parents = world.storage(Parent);
    this.widgets = world.storage(Widget);

    this.subscription = this.widgets.subscribe();
  }

  private transformChild(parent: Widget, child: Widget): void {
    child.widget.view.x = (parent.x + child.x) * this.screen.unitSize;
    child.widget.view.y = (parent.y + child.y) * this.screen.unitSize;

    alignTo(
      child.widget.view,
      parent.width,
      parent.height,
      child.pivot,
      child.widget.view
    );
  }

  private transformChildren(entity: Entity, parent: Widget): void {
    const children = this.hierarchy.children.get(entity);

    if (children) {
      for (const item of children) {
        const child = this.widgets.get(item);

        child.widget.update();

        this.transformChild(parent, child);
        this.transformChildren(item, child);
      }
    }
  }

  /** Called when an `entity` gets a `UiWidget` component attached. */
  private onWidgetAdded(entity: Entity, widget: Widget): void {
    // Needs to be updated to avoid flickering
    widget.widget.update();

    if (this.parents.has(entity)) {
      const parent = this.widgets.get(
        this.parents.get(entity).entity
      );

      // If position is not adjusted before element is added to the stage the element
      // would flicker by appearing in the wrong position for a single frame.
      this.transformChild(parent, widget);
    }
    else {
      widget.widget.view.x = widget.x * this.screen.unitSize;
      widget.widget.view.y = widget.y * this.screen.unitSize;
    }

    this.stage.add(widget.widget.view);
  }

  /**
   * Synchronizes widgets with the PIXI stage. This should be called every time widgets
   * are attached or detached from an entity.
   */
  private syncWidgetComponents(): void {
    for (const event of this.widgets.events(this.subscription)) {
      if (event.type === ComponentEventType.Added) {
        this.onWidgetAdded(event.entity, event.component);
      }
      else if (event.type === ComponentEventType.Removed) {
        this.stage.remove(event.component.widget.view);
      }
    }
  }

  /** @internal */
  private getViewPositionFromScreenPosition(widget: Widget): Vec2 {
    return this.camera.screenToWorld(widget.x, widget.y, this._scratch).scale(this.screen.unitSize);
  }

  /** @internal */
  private syncViewPosition(widget: Widget): void {
    if (widget.align === AlignWidget.World) {
      widget.widget.view.x = widget.x * this.screen.unitSize;
      widget.widget.view.y = widget.y * this.screen.unitSize;

      return;
    }

    const position = this.getViewPositionFromScreenPosition(widget);

    widget.widget.view.x = position.x;
    widget.widget.view.y = position.y;
  }

  /** @inheritDoc */
  public update(): void {
    this.syncWidgetComponents();

    // This works a similar to the transform system.
    for (const entity of this.query.entities) {
      if (this.parents.has(entity)) {
        continue;
      }

      const widget = this.widgets.get(entity);

      widget.widget.update();

      this.syncViewPosition(widget);
      this.transformChildren(entity, widget);
    }
  }

}

