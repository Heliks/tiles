import { App, runtime, World } from '@heliks/tiles-engine';
import { Script } from '../script';
import { ScriptSystem } from '../script-system';
import * as SETUP from '../setup';
import { start } from '../setup';


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
      jest.spyOn(SETUP, 'start')

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
        update: jest.fn(),
        stop: jest.fn()
      });

      const entity = world.insert(component);

      // Entity needs to be added first so that the system can properly track it
      // for destruction.
      system.onEntityAdded(world, entity);
      system.onEntityRemoved(world, entity);

      expect(component.script.stop).toHaveBeenCalledWith(world, entity);
    });
  });

  describe('update()', () => {
    it('should switch component script', () => {
      jest.spyOn(SETUP, 'start')

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
