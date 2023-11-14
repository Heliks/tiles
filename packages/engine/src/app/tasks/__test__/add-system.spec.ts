import { System } from '@heliks/ecs';
import { App } from '../../app';
import { AddSystem } from '../add-system';


describe('AddSystem', () => {
  const SCHEDULE_ID = Symbol();

  let app: App;

  beforeEach(() => {
    app = new App();
    app.dispatcher.add(SCHEDULE_ID);
  });

  describe('when resolving the system instance', () => {
    class Foo implements System {
      update = jest.fn();
    }

    it('should create system types using the apps service container', () => {
      const service = new Foo();

      app.container.make = jest.fn((): any => service);

      const result = new AddSystem(Foo, SCHEDULE_ID).getSystem(app);

      expect(result).toBe(service);
    });

    it('should return system instances', () => {
      const system = new Foo();
      const result = new AddSystem(system, SCHEDULE_ID).getSystem(app);

      expect(result).toBe(system);
    });
  });

  it('should add systems to the system dispatcher', () => {
    const system = {
      update: jest.fn()
    };

    const task = new AddSystem(system, SCHEDULE_ID);

    task.exec(app);

    // Safety: Test schedule is always registered.
    app.dispatcher.get(SCHEDULE_ID)!.update(app.world);

    // If the system was added correctly the dispatcher should've updated the system.
    expect(system.update).toHaveBeenCalledTimes(1);
  });

  it('should call OnInit lifecycle', () => {
    const system = {
      update: jest.fn(),
      onInit: jest.fn()
    };

    const task = new AddSystem(system, SCHEDULE_ID);

    task.exec(app);
    task.init(app.world);

    expect(system.onInit).toHaveBeenCalledWith(app.world);
  });
});