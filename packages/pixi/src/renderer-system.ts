import { ComponentEventType } from '@heliks/ecs';
import { contains, Injectable, OnInit, ProcessingSystem, Storage, Subscriber, World, XY } from '@heliks/tiles-engine';
import { RenderGroup } from './render-group';
import { Renderer } from './renderer';
import { RendererPlugins } from './renderer-plugins';
import { Stage } from './stage';


/** CompareFn to sort elements by depth (lower y axis first).*/
function sortByDepth(a: XY, b: XY): number {
  return a.y - b.y;
}

/** System responsible for updating the renderer. */
@Injectable()
export class RendererSystem extends ProcessingSystem implements OnInit {

  private groups!: Storage<RenderGroup>;
  private subscriber$!: Subscriber;

  constructor(
    private readonly plugins: RendererPlugins,
    private readonly renderer: Renderer,
    private readonly stage: Stage
  ) {
    super(contains(RenderGroup));
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.groups = world.storage(RenderGroup);
    this.subscriber$ = this.groups.subscribe();
  }

  /** @internal*/
  private processEventQueue(): void {
    for (const event of this.groups.events(this.subscriber$)) {
      if (event.type === ComponentEventType.Added) {
        this.stage.add(event.component.container);
      }
      else {
        this.stage.remove(event.component.container);
      }
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    this.processEventQueue();

    for (const plugin of this.plugins.items) {
      plugin.update(world);
    }

    for (const entity of this.group.entities) {
      const group = this.groups.get(entity);

      if (group.sort) {
        group.container.children.sort(sortByDepth);
      }
    }

    // Renders everything to the view.
    this.renderer.update();
    this.renderer.debugDraw.clear();
  }

}
