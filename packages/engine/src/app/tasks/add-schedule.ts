import { ScheduleId } from '@heliks/ecs';
import { App } from '../app';
import { isAfterInstruction, isBeforeInstruction, RegistrationInstruction } from './registration';
import { Task } from './task';


/**
 * @see ScheduleId
 * @see Task
 */
export class AddSchedule implements Task {

  constructor(public readonly schedule: RegistrationInstruction<ScheduleId>) {}

  /** @inheritDoc */
  public exec(app: App): void {
    if (isAfterInstruction(this.schedule)) {
      app.dispatcher.after(this.schedule.item, this.schedule.after);
    }
    else if (isBeforeInstruction(this.schedule)) {
      app.dispatcher.before(this.schedule.item, this.schedule.before);
    }
    else {
      app.dispatcher.add(this.schedule);
    }
  }

}

