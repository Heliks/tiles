import { Entity, runtime, World } from '@heliks/tiles-engine';
import { Script } from '../script';
import { start } from '../setup';


describe('Script setup', () => {
  let world: World;

  beforeEach(() => {
    world = runtime().build().world;
  });

  describe('run()', () => {
    let component: Script;
    let entity: Entity;

    beforeEach(() => {
      component = new Script({
        update: jest.fn()
      });

      entity = world.insert(component);
    })

    it('should start running the script', () => {
      const script = {
        update: jest.fn()
      };

      start(world, entity, component, script);

      expect(component._running).toBe(script);
    });

    it('should invoke start() callback on script behavior', () => {
      const script = {
        start: jest.fn(),
        update: jest.fn()
      };

      start(world, entity, component, script);

      expect(script.start).toHaveBeenCalled();
    });

    it('should invoke stop() callback on previous script behavior', () => {
      const prev = { stop: jest.fn(), update: jest.fn() };
      const next = { update: jest.fn() };

      start(world, entity, component, prev);
      start(world, entity, component, next);

      expect(prev.stop).toHaveBeenCalled();
    });
  });

});
