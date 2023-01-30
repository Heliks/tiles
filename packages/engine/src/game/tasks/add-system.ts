import { System } from '@heliks/ecs';
import { Type } from '../../utils';
import { App } from '../app';
import { World } from '../../ecs';
import { hasOnInit } from '../lifecycle';
import { Task } from './task';
import { Container } from '@heliks/tiles-injector';


/** Type or instance of a {@link System} that should be added to the dispatcher. */
export type SystemProvider = Type<System> | System;

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
   * @param system Type or instance of a {@link System system} that should be added
   *  to the system dispatcher.
   */
  constructor(protected readonly system: SystemProvider) {}

  /** @internal */
  private createSystemInstance(container: Container): System {
    return typeof this.system === 'function' ? container.make(this.system) : this.system;
  }

  /** @inheritDoc */
  public exec(app: App): void {
    this.created = this.createSystemInstance(app.container);

    // Bind system to the service container and add it to the system dispatcher.
    app.container.instance(this.created);
    app.dispatcher.add(this.created);
  }

  /** @inheritDoc */
  public init(world: World): void {
    if (this.created && hasOnInit(this.created)) {
      this.created.onInit(world);
    }
  }

  /** @internal */
  private getSystemClassName(): string {
    const system = this.system as Type;

    return system.name ? system.name : system.constructor.name;
  }

  /** @internal */
  public toString(): string {
    return `AddSystem(${this.getSystemClassName()})`;
  }

}
