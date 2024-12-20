import { Container } from 'pixi.js';
import { Drawable } from '../common';


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
   * Determines if this layer can be zoomed or not.
   *
   * @see zoom
   */
  public isZoomEnabled = true;

  /**
   * Transform components of entities that render on this layer should be multiplied by
   * this factor to achieve the correct world position with a zoomed {@link Camera}.
   */
  public cameraTransformMultiplier = 1;

  /**
   * @param id Unique Layer ID.
   */
  constructor(public readonly id: LayerId) {}

  /** Adds `drawable` to the layer {@link container}. */
  public add(drawable: Drawable): this {
    this.container.addChild(drawable);

    return this;
  }

  /** Removes `drawable` from the layer container. */
  public remove(drawable: Drawable): this {
    this.container.removeChild(drawable)

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

  /**
   * Disables or enables zoom.
   *
   * When zooming is disabled, this layer will ignore all camera zoom. This means that
   * everything rendered on this layer will stay the same size regardless of how far the
   * camera has been zoomed in or out. This is useful for UI layers that are sized
   * independently of the normal game world.
   *
   * Zoom is enabled by default.
   */
  public zoom(value: boolean): this {
    this.isZoomEnabled = value;

    return this;
  }

}
