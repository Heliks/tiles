import { hasOnInit, World } from '@heliks/tiles-engine';
import { RendererSystem } from './renderer-system';


/**
 * Resource on which {@link RendererSystem renderer systems} will be registered when they
 * are added to the {@link AppBuilder}.
 */
export class RendererSystemDispatcher {

  /** @internal */
  public readonly systems: RendererSystem[] = [];

  /** @internal */
  public init(world: World): void {
    for (const system of this.systems) {
      if (hasOnInit(system)) {
        system.onInit(world);
      }
    }
  }

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
