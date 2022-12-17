import { System } from '@heliks/ecs';
import { Type } from '../../types';
import { Game } from '../game';
import { World } from '../../ecs';
import { hasOnInit } from '../lifecycle';
import { Task } from './task';
import { Container } from '@heliks/tiles-injector';
import { RendererSystem, RendererSystemDispatcher } from '../../renderer';


/**
 * Type or instance of a {@link RendererSystem} that should be added to
 * the {@link RendererSystemDispatcher}.
 */
export type RendererSystemProvider = Type<RendererSystem> | RendererSystem;

/**
 * Adds a system to the dispatcher and registers it on the service container. If a
 * system type is given instead, it will be instantiated with service container first.
 *
 * @see System
 */
export class AddRendererSystem implements Task {

  /** @internal */
  private created?: System;

  /**
   * @param system Instance or type of a renderer system.
   */
  constructor(private readonly system: RendererSystemProvider) {}

  /** @internal */
  private createSystemInstance(container: Container): System {
    return typeof this.system === 'function' ? container.make(this.system) : this.system;
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    const system = this.createSystemInstance(game.container);

    game
      .world
      .get(RendererSystemDispatcher)
      .add(system);

    this.created = system;
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

    return system.name
      ? system.name
      : system.constructor.name;
  }

  /** @internal */
  public toString(): string {
    return `add-renderer-system: ${this.getSystemClassName()}`;
  }

}
