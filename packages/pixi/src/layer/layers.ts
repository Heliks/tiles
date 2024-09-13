import { Container } from 'pixi.js';
import { Layer, LayerId } from './layer';


/**
 * Manages renderer {@link Layer layers}.
 *
 * Layers are created by inserting a {@link LayerId} into this service. This id acts as
 * a reference to the layer and must therefore be unique across all layers. Sprites and
 * other drawables can then use that ID to tell the renderer that they want to be placed
 * in the {@link container} of that particular layer.
 *
 * The content of layers is scaled automatically according to resolution and camera z
 * zoom factor.
 */
export class Layers {

  /**
   * Container where {@link Layer layers} will be rendered. The order of children in
   * this container is guaranteed to be in sync with the {@link items} array.
   */
  public readonly container = new Container();

  /** Array that contains all known layers in the order in which they are rendered. */
  public readonly items: Layer[] = [];

  /** Lookup for the index that a layer occupies. */
  private readonly lookup = new Map<LayerId, number>();

  /**
   * Returns the index of the layer matching `id`. Throws an error if the ID does not
   * match any layers.
   */
  public getIndex(id: LayerId): number {
    const index = this.lookup.get(id)

    if (index === undefined) {
      throw new Error(`Invalid layer ${id}`);
    }

    return index;
  }

  /** Inserts a new {@link Layer} at the given `index`. */
  public insertAt(id: LayerId, index: number): Layer {
    if (this.lookup.has(id)) {
      throw new Error(`A layer with ID ${id} already exists.`);
    }

    const layer = new Layer(id);

    this.items.splice(index, 0, layer);
    this.container.addChildAt(layer.container, index);

    // Re-calculate lookup table.
    this.lookup.clear();

    for (let i = 0, l = this.items.length; i < l; i++) {
      this.lookup.set(this.items[i].id, i);
    }

    return layer;
  }

  /**
   * Inserts a new {@link Layer layer}.
   */
  public add(id: LayerId): Layer {
    return this.insertAt(id, this.items.length);
  }

  /**
   * Inserts a new {@link Layer} after the layer matching `afterId`. Throws an error if
   * the layer after which it should be inserted does not exist.
   */
  public after(id: LayerId, afterId: LayerId): Layer {
    return this.insertAt(id, this.getIndex(afterId) + 1);
  }

  /**
   * Inserts a new {@link Layer} before the layer matching `beforeId`. Throws an error if
   * the layer before it should be inserted does not exist.
   */
  public before(id: LayerId, beforeId: LayerId): Layer {
    return this.insertAt(id, this.getIndex(beforeId));
  }

  /**
   * Returns the {@link Layer} matching the given `id`. Throws an error if no layer with
   * that id exists.
   */
  public get(id: LayerId): Layer {
    return this.items[ this.getIndex(id) ];
  }

  /**
   * Returns the {@link Layer} at the given `index`. Throws an error if no layer exists
   * at that index.
   */
  public getAt(index: number): Layer {
    const layer = this.items[ index ];

    if (! layer) {
      throw new Error(`Invalid layer index ${index}`);
    }

    return layer;
  }

}
