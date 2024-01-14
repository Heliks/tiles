import { Schedule, ScheduleId, System } from '@heliks/ecs';
import { hasOnInit, World } from '../../ecs';
import { getTypeName, isType, TypeLike } from '../../utils';
import { App } from '../app';
import { Task } from './task';


/** Adds a {@link System system} to a {@link Schedule}. */
export class AddSystem implements Task {

  /** @internal */
  private instance?: System;

  /**
   * @param system The ECS {@link System} that should be added to the dispatcher.
   * @param schedule Id of the schedule to which the system should be added.
   */
  constructor(
    private readonly system: TypeLike<System>,
    private readonly schedule: ScheduleId
  ) {}

  /**
   * Returns the {@link system} instance. If {@link system} is a {@link Type}, it will
   * be created using the service container.
   */
  public getSystem(app: App): System {
    return isType(this.system) ? app.container.make(this.system) : this.system;
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
  public toString(): string {
    return 'Add System: ' + getTypeName(this.system);
  }

  /** @inheritDoc */
  public exec(app: App): void {
    this.instance = this.getSystem(app);

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
