import { Container } from './drawable';


/** Groups drawable objects. */
export class RenderGroup {

  /** Contains renderer objects that belong to entities that are a member of this group. */
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
   */
  constructor(public sort = false) {}

}
