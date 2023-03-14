import { Schedule, ScheduleId, System } from '@heliks/ecs';
import { Type } from '../../utils';
import { App } from '../app';
import { World } from '../../ecs';
import { hasOnInit } from '../lifecycle';
import { Task } from './task';
import { Container } from '@heliks/tiles-injector';


/** Type or instance of a {@link System} that should be added to the dispatcher. */
export type SystemProvider = Type<System> | System;

/**
 * Adds a {@link System system} to a {@link Schedule}.
 *
 * The system can either be an instance or a class type. If it is the latter, the system
 * will be instantiated using the service container.
 */
export class AddSystem implements Task {

  /** @internal */
  private instance?: System;

  /**
   * @param system The ECS {@link System} that should be added to the dispatcher.
   * @param schedule Id of the schedule to which the system should be added.
   */
  constructor(
    private readonly system: SystemProvider,
    private readonly schedule: ScheduleId
  ) {}

  /** @internal */
  private createSystemInstance(container: Container): System {
    return typeof this.system === 'function' ? container.make(this.system) : this.system;
  }

  /** @internal */
  private getSchedule(app: App): Schedule {
    const schedule = app.dispatcher.get(this.schedule);

    if (! schedule) {
      throw new Error(`Invalid schedule: ${this.schedule.toString()}`);
    }

    return schedule;
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
    return `AddSystem(${this.getSystemClassName()})`;
  }

  /** @inheritDoc */
  public exec(app: App): void {
    this.instance = this.createSystemInstance(app.container);

    app.container.instance(this.instance);

    this.getSchedule(app).add(this.instance);
  }

  /** @inheritDoc */
  public init(world: World): void {
    if (this.instance && hasOnInit(this.instance)) {
      this.instance.onInit(world);
    }
  }

}
