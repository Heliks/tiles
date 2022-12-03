import { Subscriber, World } from '@heliks/tiles-engine';
import { Query } from '@heliks/tiles-engine';
import { Stage } from '@heliks/tiles-pixi';
import { UiRoot } from './ui-root';


export class SyncRoots {

  /** @internal */
  private query!: Query;

  /** @internal */
  private subscription!: Subscriber;

  /**
   * @param stage Renderer stage.
   */
  constructor(private readonly stage: Stage) {}

  /** @inheritDoc */
  public onInit(world: World): void {
    this.query = world
      .query()
      .contains(UiRoot)
      .build();

    this.subscription = this.query.events.subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const store = world.storage(UiRoot);

    for (const event of this.query.events.read(this.subscription)) {
      const root = store.get(event.entity);

      if (event.isAdded) {
        this.stage.add(root.container);
      }
      else {
        this.stage.remove(root.container);
      }
    }
  }

}
