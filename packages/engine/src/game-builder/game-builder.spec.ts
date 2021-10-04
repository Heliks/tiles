import { GameBuilder } from './game-builder';
import { Game } from '../game';
import { getStorageInjectorToken } from '../ecs';
import { Storage } from '@heliks/ecs';

describe('GameBuilder', () => {
  it('should build a game', () => {
    expect(new GameBuilder().build()).toBeInstanceOf(Game);
  });

  it('should bind class providers to the service container', () => {
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

  it('should bind value providers to the service container', () => {
    const container = new GameBuilder()
      .provide({ token: '1', value: 'foo' })
      .provide({ token: '2', value: 'bar' })
      .build()
      .container;

    expect(container.get('1')).toBe('foo');
    expect(container.get('2')).toBe('bar');
  });

  it('should bind component storages to the service container', () => {
    // Test component.
    class Foo {}

    const container = new GameBuilder()
      .component(Foo)
      .build()
      .container;

    // Try to resolve storage from service container.
    const storage = container.get<Storage<Foo>>(getStorageInjectorToken(Foo));

    expect(storage.type).toBe(Foo);
  });

  // Factory providers.
  describe('factory providers', () => {
    let counter = 0;

    beforeEach(() => {
      // Reset the counter on each test run.
      counter = 0;
    });

    /** Returns an incremented version of `counter`. */
    function factory(): number {
      return ++counter;
    }

    it('should be bound as factories', () => {
      const game = new GameBuilder()
        .provide({
          factory,
          token: 'counter'
        })
        .build();

      expect(game.container.get('counter')).toBe(1);
      expect(game.container.get('counter')).toBe(2);
    });

    it('should be bound as singletons', () => {
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

  it('should register game systems', () => {
    const update = jest.fn();

    // Test game system.
    class Foo {
      update = update;
    }

    const game = new GameBuilder()
      .system(Foo)
      .build();

    // Update all systems.
    game.dispatcher.update();

    // If the system was added correctly the dispatcher should've
    // also called update() on the test system.
    expect(update).toHaveBeenCalledTimes(1);
  });
});
