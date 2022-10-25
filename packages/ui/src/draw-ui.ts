import {
  Entity,
  EntityQueryEvent,
  Hierarchy,
  Injectable,
  OnInit,
  Parent,
  Query,
  Storage,
  Subscriber,
  Vec2,
  World
} from '@heliks/tiles-engine';
import { Camera, RendererPlugin, Screen, Stage } from '@heliks/tiles-pixi';
import { AlignNode, UiNode } from './ui-node';


/**
 * Plugin for the PIXI.js renderer that draws {@link UiNode} components to the
 * renderer stage.
 */
@Injectable()
export class DrawUi implements OnInit, RendererPlugin {

  /** @internal */
  private nodes!: Storage<UiNode>;
  private parents!: Storage<Parent>;
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
      .contains(UiNode)
      .build();

    this.parents = world.storage(Parent);
    this.nodes = world.storage(UiNode);

    this.subscription = this.query.events.subscribe();
  }

  /** @internal */
  private transformChild(parent: UiNode, child: UiNode): void {
    child.widget.view.x = (parent.x + child.x) * this.screen.unitSize;
    child.widget.view.y = (parent.y + child.y) * this.screen.unitSize;

    child.updateViewPivot();
  }

  /** @internal */
  private transformChildren(world: World, entity: Entity, parent: UiNode): void {
    const children = this.hierarchy.children.get(entity);

    if (children) {
      for (const item of children) {
        const child = this.nodes.get(item);

        child.widget.update(world);

        this.transformChild(parent, child);
        this.transformChildren(world, item, child);
      }
    }
  }

  /** Called when an `entity` gets a `UiWidget` component attached. */
  private onWidgetAdded(world: World, entity: Entity, node: UiNode): void {
    // Update to avoid flickering.
    node.widget.update(world);

    if (this.parents.has(entity)) {
      const parent = this.nodes.get(
        this.parents.get(entity).entity
      );

      // If position is not adjusted before element is added to the stage the element
      // would flicker by appearing in the wrong position for a single frame.
      this.transformChild(parent, node);
    }
    else {
      node.widget.view.x = node.x * this.screen.unitSize;
      node.widget.view.y = node.y * this.screen.unitSize;
    }

    this.stage.add(node.widget.view);
  }

  /**
   * Synchronizes the widget view of UI nodes with the renderer stage. New nodes will
   * have their view added to the stage, destroyed nodes will have their views removed.
   */
  private syncNodeViews(world: World): void {
    for (const event of this.query.events.read(this.subscription)) {
      const node = this.nodes.get(event.entity);

      if (event.type === EntityQueryEvent.Added) {
        this.onWidgetAdded(world, event.entity, node);
      }
      else {
        this.stage.remove(node.widget.view);
      }
    }
  }

  /** @internal */
  private getViewPositionFromScreenPosition(node: UiNode): Vec2 {
    return this.camera.screenToWorld(node.x, node.y, this._scratch).scale(this.screen.unitSize);
  }

  /** @internal */
  private syncViewPosition(node: UiNode): void {
    if (node.align === AlignNode.World) {
      node.widget.view.x = node.x * this.screen.unitSize;
      node.widget.view.y = node.y * this.screen.unitSize;

      return;
    }

    const position = this.getViewPositionFromScreenPosition(node);

    node.widget.view.x = position.x;
    node.widget.view.y = position.y;
  }

  /** @inheritDoc */
  public update(world: World): void {
    this.syncNodeViews(world);

    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      if (this.parents.has(entity)) {
        continue;
      }

      node.widget.update(world);
      node.updateViewPivot();

      this.syncViewPosition(node);
      this.transformChildren(world, entity, node);
    }
  }

}

