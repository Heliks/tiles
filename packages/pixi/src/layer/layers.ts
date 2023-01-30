import { Layer, LayerId } from './layer';
import { Container } from 'pixi.js';


/**
 * Manages renderer {@link Layer layers}.
 *
 * Layers are created by inserting a {@link LayerId} into this service. This id acts as
 * a reference to the layer and must therefore be unique across all layers. Sprites and
 * other drawables can then use that ID to tell the renderer that they want to be placed
 * in the {@link container} of that particular layer.
 *
 * The renderer will scale all layers appropriately according to resolution and zoom
 * factor, which means that on a 200x200px wide screen with a 100x100px resolution, a
 * drawable with a size of 20x20px is rendered as 40x40px.
 */
export class Layers {

  /**
   * Container where the individual {@link Layer layer} containers will be rendered. The
   * order is guaranteed to be synchronized with the {@link layers} order.
   */
  public readonly container = new Container();

  /** @internal */
  private readonly layers: Layer[] = [];

  /**
   * Returns the current index position of the {@link Layer} matching `id` in the layer
   * order. Returns `-1` if `id` does not match any layers.
   */
  public getIndex(id: LayerId): number {
    return this.layers.findIndex(layer => layer.id === id);
  }

  /** @internal */
  private insertAt(layer: Layer, index: number): void {
    this.layers.splice(index, 0, layer);
    this.container.addChildAt(layer.container, index);
  }

  /**
   * Inserts a new {@link Layer layer}.
   */
  public add(id: LayerId): Layer {
    const layer = new Layer(id);

    this.layers.push(layer);
    this.container.addChild(layer.container);

    return layer;
  }

  /**
   * Inserts a new {@link Layer layer} after the layer matching `afterId`. Throws an
   * error if the layer after which it should be inserted does not exist.
   */
  public after(id: LayerId, afterId: LayerId): Layer {
    const layer = new Layer(id);

    this.insertAt(layer, this.getIndex(afterId) + 1);

    return layer;
  }

  /**
   * Inserts a new {@link Layer layer} before the layer matching `beforeId`. Throws an
   * error if the layer before it should be inserted does not exist.
   */
  public before(id: LayerId, beforeId: LayerId): Layer {
    const layer = new Layer(id);

    this.insertAt(layer, this.getIndex(beforeId));

    return layer;
  }

  /**
   * Returns the {@link Layer} matching the given `id`. Throws an error if no layer with
   * that id exists.
   */
  public get(id: LayerId): Layer {
    const index = this.getIndex(id);

    if (index === -1) {
      throw new Error(`Unknown layer ${id}`);
    }

    return this.layers[ index ];
  }


  /**
   * Returns the {@link Layer} at the given `index`. Throws an error if no layer exists
   * at that index.
   */
  public getAt(index: number): Layer {
    const layer = this.layers[ index ];

    if (! layer) {
      throw new Error(`Invalid layer index ${index}`);
    }

    return layer;
  }

}
