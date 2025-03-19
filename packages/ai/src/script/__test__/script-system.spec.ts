import { App, runtime, World } from '@heliks/tiles-engine';
import { Script } from '../script';
import { ScriptSystem } from '../script-system';


describe('ScriptSystem', () => {
  let app: App;
  let world: World;
  let system: ScriptSystem;

  beforeEach(() => {
    app = runtime()
      .system(ScriptSystem)
      .build()
      .boot();

    world = app.world;
    system = world.get(ScriptSystem);
  });

  describe('onEntityAdded()', () => {
    it('should start the script', () => {
      const component = new Script({
        update: jest.fn()
      });

      component.start = jest.fn();

      const entity = world.insert(component);

      system.onEntityAdded(world, entity);

      expect(component.start).toHaveBeenCalled();
    });
  });

  describe('onEntityRemoved()', () => {
    it('should invoke stop() callback on running script', () => {
      const component = new Script({
        update: jest.fn()
      });

      component.stop = jest.fn();

      const entity = world.insert(component);

      system.onEntityRemoved(world, entity);

      expect(component.stop).toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should switch component script', () => {
      const prev = { update: jest.fn() };
      const next = { update: jest.fn() };

      const component = new Script(next);
      const entity = world.insert(component);

      component._running = prev;
      component.start = jest.fn();

      app.update();

      expect(component.start).toHaveBeenCalledWith(world, entity, next);
    });

    it('should update running script', () => {
      const component = new Script({
        update: jest.fn()
      });

      const entity = world.insert(component);

      app.update();

      expect(component.script.update).toHaveBeenCalledWith(world, entity);
    });
  });
});
