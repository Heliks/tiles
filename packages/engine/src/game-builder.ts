import 'reflect-metadata';
import { ClassType } from '@tiles/common';
import { World } from './world';
import { Game } from './game';
import { Container } from '@tiles/injector';
import { ModuleData, ModuleFactory, Provider } from './module';

function setupProvider(container: Container, provider: Provider): void {
  if (typeof provider === 'function') {
    container.instance(container.make(provider));
  }
  // Custom provider
  else {
    container.bind(
      provider.token,
      provider.value
    );
  }
}

export interface GameBuilderOperation {
  /** Executes the builder operation. */
  exec(world: World): void;
}

/** Operation for adding a module to the game. */
export class AddModule implements GameBuilderOperation {

  /**
   * @param data Module data that should be added.
   */
  constructor(public readonly data: ClassType<unknown> | ModuleData) {}

  /** {@inheritDoc} */
  public exec(world: World): void {
    world.get(ModuleFactory).create(this.data);
  }

}

/** Operation for adding a provider to the game. */
export class AddProvider implements GameBuilderOperation {

  /**
   * @param provider Provider that should be added.
   */
  constructor(public readonly provider: Provider) {}

  /** {@inheritDoc} */
  public exec(world: World): void {
    setupProvider(world.container, this.provider);
  }

}

export class GameBuilder {

  /**
   * All operations that were added with builder methods such as `module()`
   * or `provider()`. Will be executed when `build()` is called.
   */
  protected readonly ops: GameBuilderOperation[] = [];

  /**
   * Adds the given module to the game.
   *
   * ```ts
   * @ModuleDesc({
   *   provides: [
   *     { symbol: 'foo', value: 'foo' }
   *   ]
   * })
   * class Foo {}
   *
   * // Undecorated class.
   * class Bar {}
   *
   * new GameBuilder()
   *  .module(Foo)
   *  .module({
   *     provides: [
   *       { symbol: 'foo', value: 'foo' }
   *     ],
   *     module: Bar
   *  })
   * ```
   *
   * @see ModuleData
   */
  public module(module: ClassType<unknown> | ModuleData): this {
    this.ops.push(new AddModule(module));

    return this;
  }

  /**
   * Adds the given `provider` to the games global service container.
   *
   * ```ts
   * @Injectable()
   * class Foo {}
   *
   * new GameBuilder()
   *  // Foo will be instantiated and then provided
   *  .provide(Foo)
   *  // This will bind the constructor of Foo to the string 'foo' without
   *  // instantiating it first.
   *  .provide({
   *    symbol: 'foo',
   *    value: Foo
   *  });
   * ```
   */
  public provide(provider: Provider): this {
    this.ops.push(new AddProvider(provider));

    return this;
  }

  /** Returns a `Game` instance. */
  public build(): Game {
    const game = new Game();

    for (const op of this.ops) {
      op.exec(game.world);
    }

    return game;
  }

}
