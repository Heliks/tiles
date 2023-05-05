import { Injectable, System, World } from '@heliks/tiles-engine';
import { Renderer } from './renderer';


/** System responsible for updating the renderer. */
@Injectable()
export class UpdateRenderer implements System {

  constructor(private readonly renderer: Renderer) {}

  /** @inheritDoc */
  public update(world: World): void {
    this.renderer.update();
  }

}
