import { ComponentEventType, Entity, Injectable, Storage, Subscriber, System, World } from '@heliks/tiles-engine';
import { RenderGroup } from './render-group';
import { Stage } from './stage';


@Injectable()
export class SyncGroups implements System {

  /** @internal */
  private groups!: Storage<RenderGroup>;

  /** @internal */
  private subscriber$!: Subscriber;

  constructor(private readonly stage: Stage) {}

  /** @inheritDoc */
  public boot(world: World): void {
    this.groups = world.storage(RenderGroup);
    this.subscriber$ = this.groups.subscribe();
  }

  /** @internal */
  private add(entity: Entity, component: RenderGroup): void {
    this.stage.insert(component.container, component.group);
    this.stage.groups.set(entity, component);
  }

  /** @internal */
  private remove(entity: Entity, component: RenderGroup): void {
    this.stage.remove(component.container);
    this.stage.groups.delete(entity)
  }

  /** @inheritDoc */
  public update(): void {
    for (const event of this.groups.events(this.subscriber$)) {
      if (event.type === ComponentEventType.Added) {
        this.add(event.entity, event.component);
      }
      else {
        this.remove(event.entity, event.component);
      }
    }
  }

}
