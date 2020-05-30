import { Container } from 'pixi.js';

/**
 *
 */
export class Stage extends Container {

  /**
   * The zIndex of the stage is fixed to `0` so that it is always rendered
   * first.
   */
  public readonly zIndex = 0;

}
