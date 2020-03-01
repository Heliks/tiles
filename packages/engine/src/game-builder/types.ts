import { ClassType } from '@tiles/common';
import { System } from '@tiles/entity-system';
import { InjectorToken } from '@tiles/injector';
import { Game } from '../game';

/**
 * Provides a value to the service container.
 */
export interface ValueProvider {
  /**
   * The token that should be used to bind the value to the
   * service container.
   */
  token: InjectorToken;
  /**
   * The value that should be bound with `token`.
   */
  value: unknown;
}

/**
 * Provides a class that will be instantiated with the
 * service container when the app is started.
 */
export type ClassProvider= ClassType<unknown>;


export type Provider = ClassProvider | ValueProvider;

export interface GameBuilder {
  provide(provider: Provider): this;
  system(system: ClassType<System>): this;
}

export interface Module<T extends GameBuilder = GameBuilder> {
  build(builder: GameBuilder): unknown;
}




