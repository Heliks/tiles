import { Injectable } from '@heliks/tiles-engine';
import { Container, Renderable } from './renderables';
import { depthSort, DepthSortable } from './depth';
import { ScreenDimensions } from './screen-dimensions';

/** @internal */
class StageLayer extends Container<Renderable & DepthSortable> {
  /** If set to `true` the layer will be depth sorted automatically on each frame. */
  public sortable = false;
}

@Injectable()
export class Stage {

  /** Contains everything that the stage displays. */
  public readonly view = new Container();

  /**
   * Container for stage layers. The order of those layer containers is guaranteed, which
   * means that the container at index `0` is the first layer, `1` the second and so on.
   */
  private readonly layers = new Container<StageLayer>();

  constructor(private readonly dimensions: ScreenDimensions) {
    this.view.addChild(this.layers);
  }

  /** Returns the `Container` that belongs to a `layer` index. */
  protected getLayerContainer(layer: number): StageLayer {
    const containers = this.layers.children;

    // Grow layers until we can access the given index.
    while (layer > containers.length - 1) {
      this.layers.addChild(new StageLayer());
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

  /** Sets `layer` as sortable. */
  public setLayerAsSortable(layer: number): void {
    this.getLayerContainer(layer).sortable = true;
  }

  /** Updates the stage. */
  public update(): void {
    const offset = this.dimensions.getOffset();

    this.layers.x = offset[0];
    this.layers.y = offset[1];

    for (const layer of this.layers.children) {
      if (layer.sortable) {
        depthSort(layer.children)
      }
    }
  }

}
