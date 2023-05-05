import { ScheduleId } from '@heliks/ecs';
import { Builder } from './builder';
import { AddSchedule, RegistrationPosition } from './tasks';


export class ScheduleBuilder<A extends Builder> {

  /**
   * @param app App builder that produced this schedule builder. Will be returned after
   *  the schedule task has been added.
   */
  constructor(private readonly app: A) {}

  /** Registers a `schedule` before `other`. */
  public before(schedule: ScheduleId, other: ScheduleId): A {
    return this.app.task(
      new AddSchedule({
        before: other,
        item: schedule,
        position: RegistrationPosition.Before
      })
    );
  }

  /** Registers a `schedule` after `other`. */
  public after(schedule: ScheduleId, other: ScheduleId): A {
    return this.app.task(
      new AddSchedule({
        after: other,
        item: schedule,
        position: RegistrationPosition.After
      })
    );
  }

}