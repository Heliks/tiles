import { Container, Drawable } from '../drawable';


/** Sorting function for children of a {@link Layer}. */
export type LayerSorter = (a: Drawable, b: Drawable) => number;

/**
 * Unique identifier for a layer. This is manually set by the user when they first add
 * the layer to the renderer via the {@link Layers}.
 */
export type LayerId = number | string;

/** Renderer layer. */
export class Layer {

  /**
   * Container where all {@link Drawable drawables} that exist on this layer will
   * be put into.
   */
  public readonly container = new Container();

  /**
   * If set, this sorter will be called once per frame to re-sort the children of the
   * layer {@link container}.
   *
   * For example, a common use case for this is to sort sprites by their Y-Axis to
   * create the perception of depth in top-down environments. This can be achieved
   * by creating a layer with a sorter like this:
   *
   * ```ts
   * const layer = new Layer(0);
   *
   * layer.sorter = (a: XY, b: XY): number {
   *   return a.y - b.y;
   * };
   * ```
   */
  public sorter?: LayerSorter;

  /**
   * @param id Unique Layer ID.
   */
  constructor(public readonly id: LayerId) {}

  /** Adds `drawable` to the layer {@link container}. */
  public add(drawable: Drawable): this {
    this.container.addChild(drawable);

    return this;
  }

  /** Sets the layer {@link sorter}. */
  public sortBy(sorter: LayerSorter): this {
    this.sorter = sorter;

    return this;
  }

  /**
   * Sorts the children of the layer {@link container}. Will return `false` if there
   * is no {@link sorter} defined for this layer.
   */
  public sort(): boolean {
    if (this.sorter) {
      this.container.children.sort(this.sorter);

      return true;
    }

    return false;
  }

}
