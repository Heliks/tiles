import { Entity, Parent, World } from '@heliks/tiles-engine';
import { Element } from '../../element';
import { UiElement } from '../../ui-element';
import { UiNode } from '../../ui-node';


/** Test element that instantly spawns a child element during its first update() call. */
export class SpawnOnUpdate implements Element {

  private spawned = false;

  constructor(public readonly element: UiElement) {}

  /** @inheritDoc */
  public update(world: World, entity: Entity): void {
    if (! this.spawned) {
      world.insert(new UiNode(), new Parent(entity), this.element)
      this.spawned = true;
    }
  }

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

}
