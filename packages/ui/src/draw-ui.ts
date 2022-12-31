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
  World,
  XY
} from '@heliks/tiles-engine';
import { Camera, RendererSystem, Screen, Stage } from '@heliks/tiles-pixi';
import { UiNode } from './ui-node';
import { UiAlign, UiRoot } from './ui-root';
import { SyncRoots } from './sync-roots';


export type UiElementNode = UiNode | UiRoot;

/**
 * Plugin for the PIXI.js renderer that draws {@link UiNode} components to the
 * renderer stage.
 */
@Injectable()
export class DrawUi implements OnInit, RendererSystem {

  /** @internal */
  private nodes!: Storage<UiNode>;
  private roots!: Storage<UiRoot>;
  private parents!: Storage<Parent>;
  private nodeQuery$!: Subscriber;
  private nodeQuery!: Query;
  private rootQuery!: Query;
  private _scratch = new Vec2();
  private readonly syncRoots: SyncRoots;

  constructor(
    private readonly camera: Camera,
    private readonly hierarchy: Hierarchy,
    private readonly stage: Stage,
    private readonly screen: Screen
  ) {
    this.syncRoots = new SyncRoots(stage);
  }

  /** @internal */
  private initQueries(world: World): void {
    this.rootQuery = world
      .query()
      .contains(UiRoot)
      .build();

    this.nodeQuery = world
      .query()
      .contains(UiNode)
      .contains(Parent)
      .build();

    this.nodeQuery$ = this.nodeQuery.events.subscribe();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.parents = world.storage(Parent);

    this.nodes = world.storage(UiNode);
    this.roots = world.storage(UiRoot);

    this.initQueries(world);
    this.syncRoots.onInit(world);

    // Synchronize existing nodes.
    for (const entity of this.nodes.entities()) {
      this.onWidgetAdded(world, entity, this.nodes.get(entity));
    }
  }

  /** @internal */
  private getViewPositionFromScreenPosition(screen: XY): Vec2 {
    return this.camera.screenToWorld(screen.x, screen.y, this._scratch).scale(this.screen.unitSize);
  }

  /**
   * Updates the position of a {@link UiRoot}. This does not apply any transform to child
   * nodes of this root.
   *
   * @internal
   */
  private updateRoot(entity: Entity, root: UiRoot): void {
    if (root.align === UiAlign.World) {
      root.container.x = root.x * this.screen.unitSize;
      root.container.y = root.y * this.screen.unitSize;

      return;
    }

    if (this.parents.has(entity)) {
      root.container.x = root.x;
      root.container.y = root.y;
    }
    else {
      const position = this.getViewPositionFromScreenPosition(root);

      root.container.x = position.x;
      root.container.y = position.y;
    }
  }

  /** @internal */
  private updateWorldAlignedNodePos(node: UiNode, parent?: UiNode): void {
    let x = node.x;
    let y = node.y;

    if (parent) {
      x += parent.x;
      y += parent.y;
    }

    node.widget.view.x = x * this.screen.unitSize;
    node.widget.view.y = y * this.screen.unitSize;
  }

  /** @internal */
  private updateScreenAlignedNodePos(node: UiNode, parent?: UiNode): void {
    node.widget.view.x = node.x;
    node.widget.view.y = node.y;

    if (parent) {
      node.widget.view.x += parent.widget.view.x;
      node.widget.view.y += parent.widget.view.y;
    }
  }

  /**
   * Updates the position of a node. The `align` is the alignment of the root node, which
   * necessarily isn't the given parent.
   *
   * @internal
   */
  private updateNodePos(node: UiNode, align: UiAlign, parent?: UiNode): void {
    if (align === UiAlign.World) {
      this.updateWorldAlignedNodePos(node, parent);
    }
    else {
      this.updateScreenAlignedNodePos(node, parent);
    }

    node.updateViewPivot();
  }

  /**
   * Updates all entities with a {@link UiNode} component that are part of the hierarchy
   * of `entity`. The `entity` isn't necessarily the owner of a {@link UiNode} and can
   * be a {@link UiRoot} component owner instead. The `align` is the alignment of the
   * root node, which necessarily isn't the given parent.
   */
  private updateNodes(world: World, entity: Entity, align: UiAlign, parent?: UiNode): void {
    const children = this.hierarchy.children.get(entity);

    if (! children) {
      return;
    }

    for (const item of children) {
      if (! this.nodes.has(item)) {
        continue;
      }

      const node = this.nodes.get(item);

      node.widget.update(world);

      this.updateNodePos(node, align, parent);
      this.updateNodes(world, item, align, node);
    }
  }

  /** @internal */
  private getNodeRootEntity(entity: Entity): Entity {
    const parent = this.parents.get(entity).entity;

    if (this.roots.has(parent)) {
      return parent;
    }

    return this.getNodeRootEntity(parent);
  }

  /** @internal */
  private getNodeRoot(entity: Entity): UiRoot {
    return this.roots.get(this.getNodeRootEntity(entity));
  }

  /**
   * Called when an `entity` gets a `UiWidget` component attached.
   *
   * @internal
   */
  private onWidgetAdded(world: World, entity: Entity, node: UiNode): void {
    // Update to avoid flickering.
    node.widget.update(world);

    // Add widget view to appropriate node root.
    this
      .getNodeRoot(entity)
      .container
      .addChild(node.widget.view);
  }

  /**
   * Synchronizes the widget view of UI nodes with the renderer stage. New nodes will
   * have their view added to the stage, destroyed nodes will have their views removed.
   *
   * @internal
   */
  private syncNodeViews(world: World): void {
    for (const event of this.nodeQuery.events.read(this.nodeQuery$)) {
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
    this.syncRoots.update(world);
    this.syncNodeViews(world);

    for (const entity of this.rootQuery.entities) {
      const root = this.roots.get(entity);

      this.updateRoot(entity, root);
      this.updateNodes(world, entity, root.align);
    }
  }

}

