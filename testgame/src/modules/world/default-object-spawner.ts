import { ObjectSpawner } from './object-spawner';
import { EntityBuilder } from '@heliks/tiles-engine';
import { Properties } from '@heliks/tiles-tmx';

export class DefaultObjectSpawner extends ObjectSpawner {

  /** @inheritDoc */
  protected onObjectEntityCreated(entity: EntityBuilder, props: Properties): void {
    return;
  }

}
