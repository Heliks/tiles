import { Injectable, System, World } from '@heliks/tiles-engine';
import { Renderer } from './renderer';
import { RendererSystemDispatcher } from './renderer-system-dispatcher';


/** System responsible for updating the renderer. */
@Injectable()
export class UpdateRenderer implements System {

  constructor(
    private readonly systems: RendererSystemDispatcher,
    private readonly renderer: Renderer
  ) {}

  /** @inheritDoc */
  public update(world: World): void {
    // Dispatch renderer systems.
    this.systems.update(world);

    // Renders everything to the view.
    this.renderer.update();
    this.renderer.debugDraw.clear();
  }

}
