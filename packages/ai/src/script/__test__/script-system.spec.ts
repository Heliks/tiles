import { App, runtime, World } from '@heliks/tiles-engine';
import { Script } from '../script';
import { ScriptSystem } from '../script-system';
import { start, stop } from '../setup';


jest.mock('../setup');

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

      const entity = world.insert(component);

      system.onEntityAdded(world, entity);

      expect(start).toHaveBeenCalledWith(
        world,
        entity,
        component,
        component.script
      );
    });
  });

  describe('onEntityRemoved()', () => {
    it('should invoke stop() callback on running script', () => {
      const component = new Script({
        update: jest.fn()
      });

      const entity = world.insert(component);

      system.onEntityRemoved(world, entity);

      expect(stop).toHaveBeenCalledWith(
        world,
        entity,
        component
      );
    });
  });

  describe('update()', () => {
    it('should switch component script', () => {
      const component = new Script({
        update: jest.fn()
      });

      const entity = world.insert(component);

      app.update();

      expect(start).toHaveBeenCalledWith(
        world,
        entity,
        component,
        component.script
      );
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
