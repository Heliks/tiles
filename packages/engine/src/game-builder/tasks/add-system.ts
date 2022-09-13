import { System } from '@heliks/ecs';
import { ClassType } from '../../types';
import { Game } from '../../game';
import { World } from '../../ecs';
import { hasOnInit } from '../lifecycle';
import { Task } from './task';
import { Container } from '@heliks/tiles-injector';


/**
 * Adds a system to the dispatcher and registers it on the service container. If a
 * system type is given instead, it will be instantiated with service container first.
 *
 * @see System
 */
export class AddSystem implements Task {

  /** @internal */
  private created?: System;

  /**
   * @param system Instance or type of a system.
   */
  constructor(protected readonly system: ClassType<System> | System) {}

  /** @internal */
  private createSystemInstance(container: Container): System {
    return typeof this.system === 'function' ? container.make(this.system) : this.system;
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    this.created = this.createSystemInstance(game.container);

    // Bind system to the service container and add it to the system dispatcher.
    game.container.instance(this.created);
    game.dispatcher.add(this.created);
  }

  /** @inheritDoc */
  public init(world: World): void {
    if (this.created && hasOnInit(this.created)) {
      this.created.onInit(world);
    }
  }

  /** @internal */
  private getSystemClassName(): string {
    const system = this.system as ClassType;

    return system.name ? system.name : system.constructor.name;
  }

  /** @internal */
  public toString(): string {
    return `AddSystem(${this.getSystemClassName()})`;
  }

}
