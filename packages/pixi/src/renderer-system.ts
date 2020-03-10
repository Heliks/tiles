import { System } from '@tiles/entity-system';
import { Injectable } from '@tiles/injector';
import { Renderer } from './renderer';

/**
 * System that is responsible for updating the renderer.
 */
@Injectable()
export class RendererSystem implements System {

  /**
   * @param renderer
   */
  constructor(protected readonly renderer: Renderer) {}

  /** {@inheritDoc} */
  public update(): void {
    this.renderer.update();
  }

}
