import { Entity, Injectable, OnInit, Parent, Query, Storage, Vec2, World, XY } from '@heliks/tiles-engine';
import { Camera, Stage } from '@heliks/tiles-pixi';
import { UiAlign, UiNode } from './ui-node';
import { SyncNodes } from './sync-nodes';
import { FlexCompositor, ApplyStyles } from './flex';


/**
 * Plugin for the PIXI.js renderer that draws {@link UiNode} components to the
 * renderer stage.
 */
@Injectable()
export class DrawUi implements OnInit {

  /** @internal */
  private nodes!: Storage<UiNode>;
  private parents!: Storage<Parent>;
  private query!: Query;
  private _scratch = new Vec2();
  private readonly syncRoots: SyncNodes;
  private readonly layout: ApplyStyles;

  constructor(
    private readonly camera: Camera,
    private readonly compositor: FlexCompositor,
    private readonly stage: Stage
  ) {
    this.layout = new ApplyStyles(compositor);
    this.syncRoots = new SyncNodes(stage);
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.parents = world.storage(Parent);
    this.nodes = world.storage(UiNode);

    this.query = world
      .query()
      .contains(UiNode)
      .build()

    this.syncRoots.onInit(world);

    this.layout.boot(world);
    this.layout.onInit(world);
  }

  /** @internal */
  private getViewPositionFromScreenPosition(screen: XY): Vec2 {
    return this.camera.screenToWorld(screen.x, screen.y, this._scratch).scale(this.camera.unitSize);
  }

  /** @internal */
  private updateNodePosition(entity: Entity, node: UiNode): void {
    // Set PIXI pivot based on node pivot.
    node.pivot.getPosition(
      node.container.width,
      node.container.height,
      node.container.pivot
    );

    if (node.align === UiAlign.World) {
      node.container.x = node.x * this.camera.unitSize;
      node.container.y = node.y * this.camera.unitSize;

      return;
    }

    if (this.parents.has(entity)) {
      node.container.x = node.x;
      node.container.y = node.y;
    }
    else {
      const position = this.getViewPositionFromScreenPosition(node);

      node.container.x = position.x;
      node.container.y = position.y;
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    this.syncRoots.update(world);

    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      this.updateNodePosition(entity, node);

      node._widget?.update(world, entity);
    }

    this.layout.update();
  }

}

