import { Renderable } from "./types";
import { Container } from "./renderer";
import { Vec2 } from "@tiles/engine";

export class Stage {

  /** Contains everything that the stage displays. */
  public readonly view = new Container();

  /**
   * Container for layer containers. Layers hold most of what is displayed in the games
   * "world" (e.g. terrain, characters etc.). The order of those layer containers is
   * guaranteed, meaning that the container at index `0` is the first layer.
   */
  protected readonly layers = new Container<Container>();

  constructor() {
    this.view.addChild(this.layers);
  }

  /** Sets the offset of the stage. */
  public setOffset(x: number, y: number): this {
    this.layers.x = x;
    this.layers.y = y;

    return this;
  }

  /** Returns the current offset. */
  public getOffset(): Vec2 {
    return [
      this.layers.x,
      this.layers.y
    ];
  }

  /** Returns the `Container` that belongs to a `layer` index. */
  protected getLayerContainer(layer: number): Container {
    const containers = this.layers.children;

    // Grow layers until we can access the given index.
    while (layer > containers.length - 1) {
      this.layers.addChild(new Container());
    }

    return containers[layer];
  }

  /** Adds a `Renderable` to the stage. */
  public add(item: Renderable, layer = 0): this {
    this.getLayerContainer(layer).addChild(item);

    return this;
  }

  /** Removes a `Renderable` from all layers of the stage. */
  public remove(item: Renderable): this {
    for (const layer of this.layers.children) {
      // eslint-disable-next-line unicorn/prefer-node-remove
      layer.removeChild(item);
    }

    return this;
  }

  /**
   * Scales the stage along its `x` and `y` axis. If no `y` axis is given the stage
   * will be scaled by ratio (y = x).
   */
  public scale(x: number, y?: number): this {
    this.view.scale.set(x, y ?? x);

    return this;
  }

}
