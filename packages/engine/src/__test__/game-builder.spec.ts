import { GameBuilder } from '../game-builder';
import { ModuleFactory } from '../module';
import { Game } from '../game';

describe('GameBuilder', () => {
  it('should build a game', () => {
    expect(new GameBuilder().build()).toBeInstanceOf(Game);
  });

  it('should build a game with modules', () => {
    class Module1 {}
    class Module2 {}

    const game = new GameBuilder()
      .module({ module: Module1 })
      .module({ module: Module2 })
      .build();

    const modules = game.world
      .get(ModuleFactory)
      .getModules();

    expect(modules.has(Module1)).toBeTruthy();
    expect(modules.has(Module2)).toBeTruthy();
  });

  it('should build a game with providers', () => {
    class Provider1 {}
    class Provider2 {}

    const game = new GameBuilder()
      .provide({
        token: 'foo',
        value: 'bar'
      })
      .provide(Provider1)
      .provide(Provider2)
      .build();

    expect(game.container.get('foo')).toBe('bar');
    expect(game.container.get(Provider1)).toBeInstanceOf(Provider1);
    expect(game.container.get(Provider2)).toBeInstanceOf(Provider2);
  });
});
