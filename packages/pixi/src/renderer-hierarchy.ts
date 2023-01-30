import { Bundle, Container, AppBuilder, hasOnInit, OnInit, Type, World } from '@heliks/tiles-engine';
import { RendererSystemDispatcher } from './renderer-system-dispatcher';
import { UpdateRenderer } from './update-renderer';
import { SpriteAnimationSystem, SpriteRenderer } from './sprite';
import { RendererSystem } from './renderer-system';


/** @internal */
type RendererSystemProvider = Type<RendererSystem> | RendererSystem;

/** @internal */
function isType(item: RendererSystemProvider): item is Type<RendererSystem> {
  return typeof item === 'function';
}

/** @internal */
function getType(item: RendererSystemProvider): Type<RendererSystem> {
  return isType(item) ? item : item.constructor as Type;
}

/** @internal */
function create(container: Container, item: RendererSystemProvider): RendererSystem {
  return isType(item) ? container.make(item) : item;
}

/**
 * Bundle that adds the renderer hierarchy to the game. Essentially, this runs the
 * renderer together will all {@link RendererSystem renderer systems}.
 *
 * For the best possible result this bundle should appear as late as possible in the
 * execution order so that all other game systems have time to update the state that
 * is rendered to the screen.
 */
export class RendererHierarchy implements Bundle, OnInit {

  /** @internal */
  private readonly systems: RendererSystemProvider[] = [];

  /** Adds a {@link RendererSystem}. */
  public use(system: RendererSystemProvider): this {
    this.systems.push(system);

    return this;
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    const dispatcher = new RendererSystemDispatcher();

    for (const item of this.systems) {
      const system = create(builder.container, item);

      dispatcher.add(system);

      builder.provide({
        instance: system
      });
    }

    builder
      .provide({
        instance: dispatcher
      })
      .system(SpriteAnimationSystem)
      .system(SpriteRenderer)
      .system(UpdateRenderer);
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    for (const item of this.systems) {
      const system = world.get(getType(item));

      if (hasOnInit(system)) {
        system.onInit(world);
      }
    }
  }

}
