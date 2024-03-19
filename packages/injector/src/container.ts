import { getMetadata } from './meta';
import { SingletonBinding } from './singleton-binding';
import { Binding, Container as Base, InjectorToken, ParamInjection, Type, ValueFactory } from './types';
import { stringifyToken } from './utils';
import { ValueBinding } from './value-binding';


/** @inheritDoc */
export class Container implements Base {

  /** Maps stuff that is bound to other stuff */
  private bindings = new Map<InjectorToken, Binding>();

  /** @inheritDoc */
  public bind<T = unknown>(token: InjectorToken, value: T): this {
    this.bindings.set(token, new ValueBinding<T>(value));

    return this;
  }

  /** @inheritDoc */
  public unbind(token: InjectorToken): this {
    this.bindings.delete(token);

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
        instance.constructor as Type,
        new ValueBinding(instance)
      );
    }

    return this;
  }

  /** @inheritDoc */
  public singleton<T = unknown>(token: InjectorToken, factory: ValueFactory<T, Container>): this {
    this.bindings.set(token, new SingletonBinding(factory));

    return this;
  }

  /** @inheritDoc */
  public factory<T = unknown>(token: InjectorToken, factory: ValueFactory<T, Container>): this {
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

  /** @inheritDoc */
  public has(token: InjectorToken): boolean {
    return this.bindings.has(token);
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
  public make<T>(target: Type<T>, params: unknown[] = [], bind = false): T {
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
    for (const [token, binding] of container.getBindings()) {
      this.bindings.set(token, binding);
    }

    return this;
  }

}
