export type OneWayBindingGetter<T> = () => T;

/**
 * If this object is passed to an attribute as a value, its getter function will be
 * bound to a components' props using a {@link PassByFunction} binding.
 */
export interface OneWayBinding<T = unknown> {
  $$get: OneWayBindingGetter<T>;
}

/** Returns `true` if `value` is a {@link OneWayBinding}. */
export function isBinding(value: unknown): value is OneWayBinding {
  return Boolean(value && (value as OneWayBinding).$$get);
}

/**
 * Creates a reference binding using `getter` that can be passed into the attribute
 * of a JSX element to create a one-way data stream.
 *
 * ```tsx
 *  class Test implements UiComponent {
 *    props!: {
 *      foo: number,
 *      bar: number
 *    }
 *
 *    render() {
 *      // ...
 *    }
 *  }
 *
 *  class Bar implements UiComponent {
 *
 *    public foo = Math.random();
 *    public bar = Math.random();
 *
 *    public update(): void {
 *      this.bar = Math.random();
 *    }
 *
 *    public render(): JsxNode {
 *      // The foo property is passed into the test component as a value. When it is
 *      // changed, it will not change its `props` counterpart.
 *      const foo = this.foo;
 *
 *      // The `bar` property will be bound and will pass down changes to its props
 *      // counterpart on the component.
 *      const bar = bind(() => this.bar);
 *
 *      return <Test foo={foo} bar={bar} />;
 *    }
 *  }
 * ```
 *
 * Note: Although the return type is `T`, the actual return value of this function is
 * a {@link OneWayBinding}. This is to trick `tsc` so that bound values can be used
 * as attributes in JSX while preserving type safety:
 *
 * ```tsx
 *  class Foo implements UiComponent {
 *    props!: { bar: string }
 *  }
 *
 *  // If bind would have the correct return type, this would throw an error because
 *  // the attribute "bar" needs to be a string.
 *  const foo = <Foo bar={bind(() => 'myValue')}>
 * ```
 */
export function bind<T>(getter: () => T): T {
  return { $$get: getter } as unknown as T;
}
