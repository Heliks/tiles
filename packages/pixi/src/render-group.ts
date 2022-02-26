import { Entity } from '@heliks/tiles-engine';
import { Container } from './drawable';


/**
 * Component that can be attached to an entity to make it a render group.
 *
 * Render groups are containers that group drawables together.
 */
export class RenderGroup {

  /** @internal */
  public readonly container = new Container();

  /** The opacity of the sprite. Value from 0-1. */
  public set opacity(opacity: number) {
    this.container.alpha = opacity;
  }

  public get opacity(): number {
    return this.container.alpha;
  }

  /**
   * @param sort If set to `true` children in this render group will be automatically
   *  depth sorted at the start of each frame.
   * @param group Entity that has a `RenderGroup` component. If set, the render group
   *  will be added to that group as a child.
   */
  constructor(public sort = false, public readonly group?: Entity) {}



}
