import {
  ClassProvider,
  FactoryProvider,
  InstanceProvider,
  isFactoryProvider,
  isInstanceProvider,
  Provider,
  ValueProvider
} from '../provider';
import { Type } from '../../types';
import { Game } from '../game';
import { Task } from './task';
import { Container } from '@heliks/tiles-injector';


/** Registers a provider on the games service container. */
export class AddProvider implements Task {

  /**
   * @param provider The provider that should be added to the game. Will be treated
   *  differently depending on what kind of provider it is.
   */
  constructor(protected readonly provider: Provider) {}

  /** Called when this task attempts to register a `ClassProvider`. */
  public class<T>(container: Container, provider: ClassProvider<T>): void {
    container.make(provider, [], true);
  }

  /** Called when this task attempts to register a `FactoryProvider`. */
  public factory(container: Container, provider: FactoryProvider): void {
    if (provider.singleton) {
      container.singleton(provider.token, provider.factory);
    }
    else {
      container.factory(provider.token, provider.factory);
    }
  }

  /** Called when this task attempts to register a `ValueProvider`. */
  public value(container: Container, provider: ValueProvider): void {
    let value = provider.value;

    if (provider.instantiate) {
      value = container.make(provider.value as Type);
    }

    container.bind(provider.token, value);
  }

  /** Called when this task attempts to register an `InstanceProvider`. */
  public instance(container: Container, provider: InstanceProvider): void {
    container.instance(provider.instance);
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    const container = game.container;
    const provider = this.provider;

    if (typeof provider === 'function') {
      // Class Provider
      this.class(container, provider);
    }
    else if (isInstanceProvider(provider)) {
      this.instance(container, provider);
    }
    else if (isFactoryProvider(provider)) {
      this.factory(container, provider);
    }
    else {
      // Value provider
      this.value(container, provider);
    }
  }

}
