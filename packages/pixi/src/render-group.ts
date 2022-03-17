import { Entity } from '@heliks/tiles-engine';
import { Container, Drawable } from './drawable';


/**
 * Sorting function for render group children.
 *
 * @see RenderGroup
 */
export type DrawableSorter = (a: Drawable, b: Drawable) => number;

/**
 * Component that can be attached to an entity to make it a render group.
 *
 * Render groups are containers that group drawables together.
 */
export class RenderGroup {

  /** @internal */
  public readonly container = new Container();

  /**
   * If set to a `DrawableSorter` function, the sorter will be used to automatically sort
   * the children of the render group at the beginning of each renderer update.
   *
   * @see DrawableSorter
   */
  public sorter?: DrawableSorter;

  /** The opacity of the sprite. Value from 0-1. */
  public set opacity(opacity: number) {
    this.container.alpha = opacity;
  }

  public get opacity(): number {
    return this.container.alpha;
  }

  /**
   * @param group Entity that has a `RenderGroup` component. If set, the render group
   *  will be added to that group as a child.
   */
  constructor(public readonly group?: Entity) {}

  /**
   * Sets a `sorter` as sort function.
   *
   * @see sort
   */
  public sort(sorter: DrawableSorter): this {
    this.sorter = sorter;

    return this;
  }

}
