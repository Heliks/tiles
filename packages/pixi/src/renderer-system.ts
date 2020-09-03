import {
  ComponentEventType,
  EntityQuery,
  Inject,
  Injectable,
  ProcessingSystem,
  Subscriber,
  Transform,
  World
} from '@heliks/tiles-engine';
import { Renderer } from './renderer';
import { RENDERER_CONFIG_TOKEN, RENDERER_PLUGINS_TOKEN, RendererConfig } from './config';
import { RendererPlugin } from './types';
import { Stage } from './stage';
import { Camera } from './camera';
import { Container } from './renderables';
import { Storage } from '@heliks/tiles-entity-system';

/** Automatically updates the [[Renderer]] once on each frame. */
@Injectable()
export class RendererSystem extends ProcessingSystem {

  /** @internal */
  private subscriber!: Subscriber;

  /**
   * @param camera [[Camera]]
   * @param config [[RendererConfig]]
   * @param plugins Renderer plugins that were registered with the renderer module.
   * @param renderer [[Renderer]]
   * @param stage [[Stage]]
   */
  constructor(
    protected readonly camera: Camera,
    @Inject(RENDERER_CONFIG_TOKEN)
    protected readonly config: RendererConfig,
    @Inject(RENDERER_PLUGINS_TOKEN)
    protected readonly plugins: RendererPlugin[],
    protected readonly renderer: Renderer,
    protected readonly stage: Stage
  ) {
    super();
  }

  /** @inheritDoc */
  public boot(world: World): void {
    // Subscribe to added / removed entities in the container storage.
    this.subscriber = world.storage(Container).events().subscribe();

    super.boot(world);
  }

  /** @internal */
  public getQuery(): EntityQuery {
    return {
      contains: [
        Container,
        Transform
      ]
    };
  }

  /**
   * Synchronizes added / removed `Container` components in `containers` with the
   * renderers stage.
   */
  public sync(containers: Storage<Container>): void {
    for (const event of containers.events().read(this.subscriber)) {
      switch (event.type) {
        case ComponentEventType.Added:
          this.stage.add(event.component);
          break;
        case ComponentEventType.Removed:
          this.stage.remove(event.component);
          break;
      }
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    const containers = world.storage(Container);
    const transforms = world.storage(Transform);

    // Add or remove container components to the stage.
    this.sync(containers);

    // Update container positions according to transform.
    for (const entity of this.group.entities) {
      const transform = transforms.get(entity);
      const container = containers.get(entity);

      container.x = transform.world[0] * this.config.unitSize;
      container.y = transform.world[1] * this.config.unitSize;

      // container.setTransform(transform.x * this.config.unitSize, transform.y * this.config.unitSize)
    }

    for (const plugin of this.plugins) {
      plugin.update(world);
    }

    // Renders everything to the view.
    this.renderer.update();

    // Clear all debug information immediately after drawing so that the next frame can
    // draw new ones.
    this.renderer.debugDraw.clear();
  }

}
