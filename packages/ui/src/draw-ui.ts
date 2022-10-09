import {
  ComponentEventType,
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
import { AlignNode, Interaction, UiNode } from './ui-node';


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

    this.subscription = this.nodes.subscribe();
  }

  private transformChild(parent: UiNode, child: UiNode): void {
    child.widget.view.x = (parent.x + child.x) * this.screen.unitSize;
    child.widget.view.y = (parent.y + child.y) * this.screen.unitSize;

    child.updateViewPivot();
  }

  private transformChildren(entity: Entity, parent: UiNode): void {
    const children = this.hierarchy.children.get(entity);

    if (children) {
      for (const item of children) {
        const child = this.nodes.get(item);

        child.widget.update();

        this.transformChild(parent, child);
        this.transformChildren(item, child);
      }
    }
  }

  private readonly nextInteractionQueue = new Map<Entity, Interaction>();

  /** Called when an `entity` gets a `UiWidget` component attached. */
  private onWidgetAdded(entity: Entity, node: UiNode): void {
    // Update to avoid flickering.
    node.widget.update();

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

  /** @internal */
  private syncNodeComponents(): void {
    for (const event of this.nodes.events(this.subscription)) {
      if (event.type === ComponentEventType.Added) {
        this.onWidgetAdded(event.entity, event.component);
      }
      else if (event.type === ComponentEventType.Removed) {
        this.stage.remove(event.component.widget.view);
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
  public update(): void {
    this.syncNodeComponents();

    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      if (this.parents.has(entity)) {
        continue;
      }

      node.widget.update();
      node.updateViewPivot();

      this.syncViewPosition(node);
      this.transformChildren(entity, node);
    }
  }

}

