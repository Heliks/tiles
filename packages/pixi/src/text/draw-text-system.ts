import {
  contains,
  Entity,
  Injectable,
  InjectStorage,
  ReactiveSystem,
  Storage,
  Transform,
  World
} from '@heliks/tiles-engine';
import { DrawText } from './draw-text';
import { Screen } from '../screen';
import { Stage } from '../stage';


/** System that updates `DrawText` components. */
@Injectable()
export class DrawTextSystem extends ReactiveSystem {

  constructor(
    @InjectStorage(DrawText)
    private readonly $text: Storage<DrawText>,
    @InjectStorage(Transform)
    private readonly $transform: Storage<Transform>,
    private readonly screen: Screen,
    private readonly stage: Stage
  ) {
    super(contains(DrawText, Transform));
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    this.stage.add(this.$text.get(entity).view);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.stage.remove(this.$text.get(entity).view);
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    for (const entity of this.group.entities) {
      const text = this.$text.get(entity);

      if (text.dirty) {
        text.view.text = text.text;
      }

      const transform = this.$transform.get(entity);

      text.view.x = transform.world.x * this.screen.unitSize;
      text.view.y = transform.world.y * this.screen.unitSize;
    }
  }

}
