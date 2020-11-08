import { Container, Renderable } from "./renderables";

/**
 * Attach this component to an entity to act as a parent node to other entities in the
 * renderer graph.
 */
export class RenderNode {

  /**
   * The PIXI.JS container where all children of this node will be added to. This is
   * declared here to save us an extra lookup during the world `update()`. Do not
   * modify this directly.
   */
  public readonly _container = new Container();

  /**
   * @param sortable (optional) If this is set to true the children of this node will
   *  additionally be depth-sorted before they are rendered.
   */
  constructor(public sortable = false) {}

  /**
   * Adds a `renderable` to the container of this node. This is for internal use as the
   * rendering system takes care of this based on the scene hierarchy.
   */
  public add(renderable: Renderable): this {
    this._container.addChild(renderable);

    return this;
  }

  /**
   * Removes a `renderable` from the container of this node. This is for internal use
   * as the rendering system takes care of this based on the scene hierarchy.
   */
  public remove(renderable: Renderable): this {
    // This eslint rule is a false positive.
    // eslint-disable-next-line unicorn/prefer-node-remove
    this._container.removeChild(renderable);

    return this;
  }

}
