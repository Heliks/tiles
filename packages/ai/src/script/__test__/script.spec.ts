import { Entity, runtime, World } from '@heliks/tiles-engine';
import { Script } from '../script';


describe('Script', () => {
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

      component.start(world, entity, script);

      expect(component._running).toBe(script);
    });

    it('should invoke start() callback on script behavior', () => {
      const script = {
        start: jest.fn(),
        update: jest.fn()
      };

      component.start(world, entity, script);

      expect(script.start).toHaveBeenCalled();
    });

    it('should invoke stop() callback on previous script behavior', () => {
      const prev = { stop: jest.fn(), update: jest.fn() };
      const next = { update: jest.fn() };

      component.start(world, entity, prev);
      component.start(world, entity, next);

      expect(prev.stop).toHaveBeenCalled();
    });
  });

});
