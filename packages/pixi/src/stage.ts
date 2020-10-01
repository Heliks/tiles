import { Injectable } from '@heliks/tiles-engine';
import { Container, Renderable } from './renderables';

/** A reference to a sub-group of renderables inside of the stage. */
export type NodeHandle = symbol;

/** A node in the stage, used to group other renderables. */
export abstract class StageNode extends Container {

  /** Updates the node. If implemented, this will be called on every frame. */
  public abstract update?(): void;

}

@Injectable()
export class Stage {

  /** Contains everything that the stage displays. */
  public readonly view = new Container();

  /** @internal */
  private readonly nodes = new Map<NodeHandle, StageNode>();

  /** @internal */
  public getNodeContainer(node: NodeHandle): Container {
    const container = this.nodes.get(node);

    if (!container) {
      throw new Error('Invalid Node.');
    }

    return container;
  }

  /**
   * Adds a `renderable`. If a `node` is provided it will be added as a child of that
   * node instead of the stage root. Throws when the given node is invalid.
   */
  public add(renderable: Renderable, node?: NodeHandle): this {
    if (node) {
      this.getNodeContainer(node).addChild(renderable);
    }
    else {
      this.view.addChild(renderable);
    }

    return this;
  }

  /** Removes a `renderable` from the stage. */
  public remove(renderable: Renderable): this {
    // Instead of using removeChild on this.view we do this via the renderables parent
    // because it might be a child of a node instead of the stage root. This is faster
    // than iterating over all nodes.
    //
    // Also disable the false-positive unicorn rule.
    // eslint-disable-next-line unicorn/prefer-node-remove
    renderable.parent.removeChild(renderable);

    return this;
  }

  /**
   * Registers a node and returns a reference to access it. The reference ensures that
   * renderables can not be added to arbitrary containers that don't actually exist
   * inside of the stage.
   *
   * ```ts
   * const handle = stage.registerNode(new Container());
   *
   * stage.add(item1);
   * stage.add(item2);
   *
   * // This will be rendered first, because its part of the node created above.
   * stage.add(item3, handle);
   * ```
   */
  public registerNode(node: StageNode): NodeHandle {
    const handle = Symbol();

    this.nodes.set(handle, node);
    this.add(node);

    return handle;
  }

  /**
   * Destroys the given node. All renderables that were children of that node will also
   * be removed from the stage.
   *
   * Todo: This somehow needs to interact with the SpriteDisplaySystem so that it does
   *  not process entities that will no longer be rendered when they were part of a node.
   */
  public destroyNode(handle: NodeHandle): this {
    const node = this.nodes.get(handle);

    if (node) {
      this.remove(node);
    }

    return this;
  }

  /** Calls `update` on all registered render nodes. */
  public updateNodes(): void {
    for (const node of this.nodes.values()) {
      node.update?.();
    }
  }

  /**
   * Scales the stage along its `x` and `y` axis. If no `y` axis is given the stage
   * will be scaled by ratio (y = x).
   */
  public scale(x: number, y?: number): this {
    this.view.scale.set(x, y ?? x);

    return this;
  }

  /** Sets the stage position. */
  public setPosition(x: number, y: number): void {
    this.view.x = x * this.view.scale.x;
    this.view.y = y * this.view.scale.y;
  }

}
