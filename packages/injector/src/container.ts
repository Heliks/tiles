import { SingletonBinding } from './singleton-binding';
import { Binding, BindingFactory, ClassType, Container as Base, InjectorToken, ParamInjection } from './types';
import { stringifyToken } from './utils';
import { ValueBinding } from './value-binding';
import { getMetadata } from './meta';

export class Container implements Base {

  /** Maps stuff that is bound to other stuff */
  private bindings = new Map<InjectorToken, Binding>();

  /** @inheritDoc */
  public bind<T = unknown>(token: InjectorToken, value: T): this {
    this.bindings.set(token, new ValueBinding<T>(value));

    return this;
  }

  /** @hidden */
  public getBindings(): Map<InjectorToken, Binding> {
    return this.bindings;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public instance(...values: any[]): this {
    for (const instance of values) {
      if (!instance.constructor) {
        throw new Error(
          `Cannot bind ${instance} as it doesn't have a constructor`
        );
      }

      this.bindings.set(
        instance.constructor as ClassType,
        new ValueBinding(instance)
      );
    }

    return this;
  }

  /** @inheritDoc */
  public singleton<T = unknown>(
    token: InjectorToken,
    resolver: BindingFactory<T>
  ): this {
    this.bindings.set(token, new SingletonBinding(resolver));

    return this;
  }

  /** @inheritDoc */
  public factory<T = unknown>(
    token: InjectorToken,
    factory: BindingFactory<T>
  ): this {
    this.bindings.set(token, {
      resolve: factory
    });

    return this;
  }

  /** @inheritDoc */
  public get<T>(token: InjectorToken): T {
    const binding = this.bindings.get(token) as Binding<T> | undefined;

    if (!binding) {
      throw new Error(`Unknown binding "${stringifyToken(token)}".`);
    }

    return binding.resolve(this);
  }

  /** @internal */
  private resolveTokenList(tokens: InjectorToken[], overrides?: ParamInjection[]): unknown[] {
    const result = [];

    for (let i = 0, l = tokens.length; i < l; i++) {
      let token = tokens[i];

      // Check if the index was manually overridden.
      if (overrides) {
        const override = overrides.find(item => item.index === i);

        if (override) {
          // Optional dependencies that don't exist resolve to undefined.
          if (override.optional && !this.bindings.has(override.token)) {
            // eslint-disable-next-line unicorn/no-useless-undefined
            result.push(undefined);

            continue;
          }

          token = override.token;
        }
      }

      // Resolve binding from token.
      const binding = this.bindings.get(token);

      if (!binding) {
        throw new Error(`Unknown token ${token.toString()} at index ${i}`);
      }

      result.push(binding.resolve(this));
    }

    return result;
  }

  /** @inheritDoc */
  public make<T>(target: ClassType<T>, params: unknown[] = [], bind = false): T {
    const meta = getMetadata(target);

    let values = params;

    // Inject if the target was decorated with @Injectable() and therefore has meta-
    // data. Otherwise just inject the given params.
    if (meta.params) {
      const tokens = [ ...meta.params ];

      // Make room on the right side to allow us to append the params array.
      tokens.splice(tokens.length - params.length);

      values = this.resolveTokenList(tokens, meta.paramOverrides);

      // Add custom params.
      values.push(...params);
    }

    // eslint-disable-next-line new-cap
    const instance = new target(...values);

    if (bind) {
      this.instance(instance);
    }

    return instance;
  }

  /** @inheritDoc */
  public merge(container: Container): this {
    container.getBindings().forEach((binding, sym) => {
      this.bindings.set(sym, binding);
    });

    return this;
  }

}
