import { GameBuilder } from '../game-builder';
import { Game } from '../game';

describe('GameBuilder', () => {
  it('should build a game', () => {
    expect(new GameBuilder().build()).toBeInstanceOf(Game);
  });

  it('should add class providers', () => {
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

  it('should add value providers', () => {
    const container = new GameBuilder()
      .provide({ token: '1', value: 'foo' })
      .provide({ token: '2', value: 'bar' })
      .build()
      .container;

    expect(container.get('1')).toBe('foo');
    expect(container.get('2')).toBe('bar');
  });

  it('should add systems', () => {
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
