import { World } from "../ecs";
import { RendererSystem } from './renderer-system';


/**
 * Resource on which {@link RendererSystem renderer systems} will be registered when they
 * are added to the {@link GameBuilder}. The engine does not execute this dispatcher on
 * its own. Rather, renderer module (a.E. `@heliks/tiles-pixi`) is required to make use
 * of this resource.
 */
export class RendererSystemDispatcher {

  /** @internal */
  private readonly systems: RendererSystem[] = [];

  /** Adds a renderer `system`. */
  public add(system: RendererSystem): this {
    this.systems.push(system);

    return this;
  }

  /** Updates all registered renderer systems. */
  public update(world: World): void {
    for (const system of this.systems) {
      system.update(world);
    }
  }

}
