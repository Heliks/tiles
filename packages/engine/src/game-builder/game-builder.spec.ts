import { GameBuilder } from './game-builder';
import { Game } from '../game';
import { getStorageInjectorToken, System } from '../ecs';
import { Storage } from '@heliks/ecs';


describe('GameBuilder', () => {
  it('should build a game', () => {
    expect(new GameBuilder().build()).toBeInstanceOf(Game);
  });

  it('should bind component storages to the service container', () => {
    // Test component.
    class Foo {}

    // Try to resolve storage from service container.
    const storage = new GameBuilder()
      .component(Foo)
      .build()
      .container.get<Storage<Foo>>(getStorageInjectorToken(Foo));

    expect(storage.type).toBe(Foo);
  });

  describe('systems', () => {
    it('should add game systems to the system dispatcher', () => {
      const system = {
        update: jest.fn()
      };

      const game = new GameBuilder().system(system).build();

      // Update all systems.
      game.dispatcher.update();

      // If the system was added correctly the dispatcher should've
      // also called update() on the test system.
      expect(system.update).toHaveBeenCalledTimes(1);
    });

    it('should call OnInit lifecycle hook', () => {
      const system = {
        update: () => void 0,
        onInit: jest.fn()
      };

      const game = new GameBuilder().system(system).build();

      expect(system.onInit).toHaveBeenCalledWith(game.world);
    });
  });

  describe('providers', () => {
    it('should register class providers', () => {
      class Provider1 {}
      class Provider2 {}

      const container = new GameBuilder()
        .provide(Provider1)
        .provide(Provider2)
        .build()
        .container;

      expect(container.get(Provider1)).toBeInstanceOf(Provider1);
      expect(container.get(Provider2)).toBeInstanceOf(Provider2);
    });

    it('should register value providers', () => {
      const container = new GameBuilder()
        .provide({ token: '1', value: 'foo' })
        .provide({ token: '2', value: 'bar' })
        .build()
        .container;

      expect(container.get('1')).toBe('foo');
      expect(container.get('2')).toBe('bar');
    });

    // Factory providers.
    describe('factories', () => {
      let counter = 0;

      beforeEach(() => {
        // Reset the counter on each test run.
        counter = 0;
      });

      /** Returns an incremented version of `counter`. */
      function factory(): number {
        return ++counter;
      }

      it('should be bound as factory', () => {
        const game = new GameBuilder()
          .provide({
            factory,
            token: 'counter'
          })
          .build();

        expect(game.container.get('counter')).toBe(1);
        expect(game.container.get('counter')).toBe(2);
      });

      it('should be bound as singleton', () => {
        const game = new GameBuilder()
          .provide({
            factory,
            singleton: true,
            token: 'counter'
          })
          .build();

        expect(game.container.get('counter')).toBe(1);
        expect(game.container.get('counter')).toBe(1);
      });
    });
  });

  describe('modules', () => {
    it('should register provider', () => {
      class TestService {}

      const game = new GameBuilder()
        .module({
          build: builder => void builder.provide(TestService)
        })
        .build();

      // Check if the service provided via TestModule exists on the service container.
      expect(game.container.get(TestService)).toBeInstanceOf(TestService);
    });

    it('should call OnInit lifecycle hook', () => {
      const init = jest.fn();
      const game = new GameBuilder()
        .module({
          build: () => void 0,
          onInit: init
        })
        .build();

      expect(init).toHaveBeenCalledWith(game.world);
    });
  });
});
