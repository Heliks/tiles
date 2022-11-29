import { Injectable } from '@heliks/tiles-engine';
import { Renderer } from './renderer';


/** Services that creates screenshots of the game scene. */
@Injectable()
export class Screenshot {

  /**
   * @param renderer {@link Renderer}
   */
  constructor(private readonly renderer: Renderer) {}

  /** Creates a screenshot as `HTMLCanvasElement`. */
  public canvas(): HTMLCanvasElement {
    return this.renderer.renderer.extract.canvas(this.renderer.root);
  }

}
