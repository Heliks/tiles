import { SingletonBinding } from './singleton-binding';
import { Binding, BindingFactory, BindingSymbol, ClassType, Container as Base, ParamInjection } from './types';
import { getMetadata } from './utils';
import { ValueBinding } from './value-binding';

export class Container implements Base {

  /** Maps stuff that is bound to other stuff */
  protected bindings = new Map<BindingSymbol, Binding>();

  /** {@inheritDoc Base.bind()} */
  public bind<T = unknown>(symbol: BindingSymbol, value: T): this {
    this.bindings.set(symbol, new ValueBinding<T>(value));

    return this;
  }

  /** {@hidden} */
  public getBindings(): Map<BindingSymbol, Binding> {
    return this.bindings;
  }

  /** {@inheritDoc Base.instance()} */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public instance(...values: any[]): this {
    for (const instance of values) {
      if (!instance.constructor) {
        throw new Error(`Cannot bind ${instance} as it doesn't have a constructor`);
      }

      this.bindings.set(
        instance.constructor as ClassType,
        new ValueBinding(instance)
      );
    }

    return this;
  }

  /** {@inheritDoc Base.singleton()} */
  public singleton<T = unknown>(symbol: BindingSymbol, resolver: BindingFactory<T>): this {
    this.bindings.set(symbol, new SingletonBinding(resolver));

    return this;
  }

  /** {@inheritDoc Base.factory()} */
  public factory<T = unknown>(symbol: BindingSymbol, factory: BindingFactory<T>): this {
    this.bindings.set(symbol, {
      resolve: factory
    });

    return this;
  }

  /** {@inheritDoc Base.get()} */
  public get<T>(symbol: BindingSymbol): T {
    const binding = this.bindings.get(symbol) as Binding<T> | undefined;

    if (!binding) {
      throw new Error(`Unknown binding "${symbol.toString()}".`);
    }

    return binding.resolve(this);
  }

  /**
   * Resolves the binding `symbol`. If an array of `overrides` is passed containing
   * an injection at the given `index` it will be resolved instead.
   */
  protected resolveParam(symbol: BindingSymbol, index: number, overrides?: ParamInjection[]): unknown {
    // Check if the index was manually overridden.
    if (overrides) {
      const override = overrides.find(item => item.index === index);

      if (override) {
        // Optional dependencies that don't exist resolve to undefined.
        if (override.optional && !this.bindings.has(override.symbol)) {
          return;
        }

        return this.get(override.symbol);
      }
    }

    return this.get(symbol);
  }

  /** {@inheritDoc Base.make()} */
  public make<T>(target: ClassType<T>, params: unknown[] = [], bindToInstance = false): T {
    const meta = getMetadata(target);

    let values = params;

    // Only try to inject something if the target was tagged with @Injectable() and
    // therefore has metadata. Otherwise we just continue to inject the given `params`.
    if (meta.params) {
      const symbols = [ ...meta.params ];

      // Make room on the right side to allow us to append the params array.
      symbols.splice(symbols.length - params.length);

      values = symbols.map(
        (symbol, index) => this.resolveParam(symbol, index, meta.paramOverrides)
      );

      // Add custom params.
      values.push(...params);
    }

    // eslint-disable-next-line new-cap
    const instance = new target(...values);

    if (bindToInstance) {
      this.instance(instance);
    }

    return instance;
  }

  /** {@inheritDoc Base.merge()} */
  public merge(container: Container): this {
    container.getBindings().forEach((binding, sym) => {
      this.bindings.set(sym, binding);
    });

    return this;
  }

}
