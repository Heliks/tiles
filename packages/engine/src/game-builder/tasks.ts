import { ClassType } from '../types';
import { ComponentType, System } from '@heliks/ecs';
import { Game } from '../game';
import {
  ClassProvider,
  FactoryProvider,
  InstanceProvider,
  isFactoryProvider,
  isInstanceProvider,
  Provider,
  ValueProvider
} from './provider';
import { getStorageInjectorToken, World } from '../ecs';
import { Container } from '@heliks/tiles-injector';
import { GameBuilder, Module } from './types';
import { hasOnInit } from './lifecycle';


/** Build task. */
export interface Task {

  /**
   * Executes the build tasks.
   */
  exec(game: Game): unknown;

  /**
   * Optionally does initialization logic. A.E., after we've added a module during
   * the `exec()` stage, we might want to call the `OnInit` lifecycle on that module.
   */
  init?(world: World): unknown;

}


/**
 * Registers systems. If the provided system is a system type it will be instantiated
 * by the engines service container first.
 */
export class AddSystem implements Task {

  /** @internal */
  private created?: System;

  /**
   * @param system Instance or type of a system.
   */
  constructor(protected readonly system: ClassType<System> | System) {}

  /** @internal */
  private createSystemInstance(container: Container): System {
    return typeof this.system === 'function' ? container.make(this.system) : this.system;
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    this.created = this.createSystemInstance(game.container);

    // Bind system to the service container and add it to the system dispatcher.
    game.container.instance(this.created);
    game.dispatcher.add(this.created);
  }

  /** @inheritDoc */
  public init(world: World): void {
    if (this.created && hasOnInit(this.created)) {
      this.created.onInit(world);
    }
  }

  /** @internal */
  private getSystemClassName(): string {
    const system = this.system as ClassType;

    return system.name ? system.name : system.constructor.name;
  }

  /** @internal */
  public toString(): string {
    return `AddSystem(${this.getSystemClassName()})`;
  }

}


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
      value = container.make(provider.value as ClassType);
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


/**
 * Registers a component type and binds its component storage to the service
 * container.
 */
export class AddComponent<C extends ComponentType, A extends C = C> implements Task {

  /**
   * @param component Component type that should be registered.
   * @param alias (optional) If set to a component type that has a signature that is
   *  compatible with `component`, the `component` will be registered using the same
   *  storage as `alias`.
   */
  constructor(private readonly component: C, private readonly alias?: A) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    const storage = this.alias
      ? game.world.registerAs(this.component, this.alias)
      : game.world.register(this.component);

    game.world.container.bind(getStorageInjectorToken(this.component), storage);
  }

}

export class AddModule implements Task {

  // False positive
  // eslint-disable-next-line unicorn/prefer-module
  constructor(private readonly module: Module, private readonly builder: GameBuilder) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    this.module.build(this.builder);
    this.builder.exec(game);
  }

  /** @inheritDoc */
  public init(world: World): void {
    this.builder.init(world);

    if (hasOnInit(this.module)) {
      this.module.onInit(world);
    }
  }

  /** @internal */
  public toString(): string {
    return `AddModule(${this.module.constructor.name})`;
  }

}


/** */
export type BootScript = (world: World) => unknown;

export class AddBootScript implements Task {

  constructor(private readonly script: BootScript) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    this.script(game.world);
  }

}
