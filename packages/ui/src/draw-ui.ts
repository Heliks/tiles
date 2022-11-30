import {
  Entity,
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
  private getViewPositionFromScreenPosition(node: UiNode): Vec2 {
    return this.camera.screenToWorld(node.x, node.y, this._scratch).scale(this.screen.unitSize);
  }

  /**
   * Updates the position of a {@link UiNode node} that is the root of other nodes. This
   * does not apply any transform to children of this node.
   *
   * @see transformNodeChildren
   * @internal
   */
  private transformRootNode(node: UiNode): void {
    if (node.align === AlignNode.World) {
      node.widget.view.x = node.x * this.screen.unitSize;
      node.widget.view.y = node.y * this.screen.unitSize;

      return;
    }

    const position = this.getViewPositionFromScreenPosition(node);

    node.widget.view.x = position.x;
    node.widget.view.y = position.y;
  }

  /**
   * Updates the position of a node that is a child of `parent`. The `align` is the
   * alignment of the root node, which necessarily isn't the given parent.
   *
   * @internal
   */
  private transformChildNode(parent: UiNode, child: UiNode, align: AlignNode): void {
    if (align === AlignNode.World) {
      child.widget.view.x = (parent.x + child.x) * this.screen.unitSize;
      child.widget.view.y = (parent.y + child.y) * this.screen.unitSize;
    }
    else {
      child.widget.view.x = parent.widget.view.x + child.x;
      child.widget.view.y = parent.widget.view.y + child.y;
    }

    child.updateViewPivot();
  }

  /**
   * Updates the position of all {@link UiNode nodes} that are children of the given
   * parent `entity`. The `align` is the alignment of the root node, which necessarily
   * isn't the given parent.
   *
   * @see transformChildNode
   * @internal
   */
  private transformNodeChildren(world: World, entity: Entity, node: UiNode, align: AlignNode): void {
    const children = this.hierarchy.children.get(entity);

    if (children) {
      for (const item of children) {
        const child = this.nodes.get(item);

        child.widget.update(world);

        this.transformChildNode(node, child, align);
        this.transformNodeChildren(world, item, child, align);
      }
    }
  }

  /**
   * Called when an `entity` gets a `UiWidget` component attached.
   *
   * @internal
   */
  private onWidgetAdded(world: World, entity: Entity, node: UiNode): void {
    // Update to avoid flickering.
    node.widget.update(world);

    if (this.parents.has(entity)) {
      const parent = this.nodes.get(
        this.parents.get(entity).entity
      );

      // If position is not adjusted before element is added to the stage the element
      // would flicker by appearing in the wrong position for a single frame.
      this.transformChildNode(parent, node, parent.align);
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
   *
   * @internal
   */
  private syncNodeViews(world: World): void {
    for (const event of this.query.events.read(this.subscription)) {
      const node = this.nodes.get(event.entity);

      if (event.isAdded) {
        this.onWidgetAdded(world, event.entity, node);
      }
      else {
        this.stage.remove(node.widget.view);
      }
    }
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

      this.transformRootNode(node);
      this.transformNodeChildren(world, entity, node, node.align);
    }
  }

}

