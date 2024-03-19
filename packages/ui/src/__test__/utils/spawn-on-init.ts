import { Entity, Parent, World } from '@heliks/tiles-engine';
import { Element } from '../../element';
import { OnInit } from '../../lifecycle';
import { UiElement } from '../../ui-element';
import { UiNode } from '../../ui-node';


/** Test element that instantly spawns a child element during its OnInit lifecycle. */
export class SpawnOnInit implements Element, OnInit {

  constructor(public readonly element: UiElement) {}

  public onInit(world: World, entity: Entity): void {
    world.insert(new UiNode(), new Parent(entity), this.element)
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity): void {}

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

}
