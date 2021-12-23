import { Container } from '../container';
import { Inject, Injectable, Optional } from '../decorators';

describe('Container', () => {
  class A {
    public foo = true;
  }

  class B {
    public bar = true;
  }

  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.bind(A, new A());
    container.bind(B, new B());
  });

  it('should resolve values bound to a class', () => {
    expect(container.get<A>(A).foo).toBe(true);
    expect(container.get<B>(B).bar).toBe(true);
  });

  it('should resolve values bound to a string', () => {
    expect(container.bind('foo', true).get('foo')).toBe(true);
    expect(container.bind('bar', true).get('bar')).toBe(true);
  });

  it('should resolve bindings', () => {
    const token1 = Symbol();
    const token2 = Symbol();

    expect(container.bind(token1, 'foo').get(token1)).toBe('foo');
    expect(container.bind(token2, 'bar').get(token2)).toBe('bar');
  });

  it('should bind an instance', () => {
    const foo = container.instance(new A()).get<A>(A);

    expect(foo.foo).toBeTruthy();
  });

  it('should bind multiple instances', () => {
    container.instance(new A(), new B());

    expect(container.get<A>(A).foo).toBeTruthy();
    expect(container.get<B>(B).bar).toBeTruthy();
  });

  it('should bind singletons', () => {
    let calls = 0;

    container.singleton('foo', () => ++calls);

    expect(container.get('foo')).toBe(1);
    expect(container.get('foo')).toBe(1);
  });

  it('should bind factories', () => {
    let counter = 0;

    container.factory('foo', () => ++counter);

    expect(container.get('foo')).toBe(1);
    expect(container.get('foo')).toBe(2);
  });

  it('should merge other containers', () => {
    const a = new Container().bind('a', 'foo');
    const b = new Container().bind('b', 'bar');

    a.merge(b);

    expect(a.get('a')).toBe('foo');
    expect(a.get('b')).toBe('bar');
  });

  describe('make()', () => {
    it('should inject constructor params', () => {
      @Injectable()
      class Test {
        constructor(
          public readonly a: A,
          public readonly b: B
        ) {}
      }

      const instance = container.make(Test);

      expect(instance.a).toBeInstanceOf(A);
      expect(instance.b).toBeInstanceOf(B);
    });

    it('should inject manually set constructor params', () => {
      @Injectable()
      class Test {
        constructor(@Inject('foo') public foo: string) {}
      }

      // Bind foo and create instance.
      const instance = container.bind('foo', 'bar').make(Test);

      expect(instance.foo).toBe('bar');
    });

    it('should inject manually set constructor params that are optional', () => {
      @Injectable()
      class Test {
        constructor(@Optional('foo') public foo?: unknown) {}
      }

      expect(container.make(Test).foo).toBeUndefined();
    });

    it('should append custom values to constructor params', () => {
      @Injectable()
      class Test {
        constructor(public readonly a: A, public readonly b: true) {}
      }

      const instance = container.make(Test, [true]);

      expect(instance.a).toBeInstanceOf(A);
      expect(instance.b).toBe(true);
    });

    it('should append custom values even if class is not tagged @Injectable()', () => {
      class Test {
        constructor(
          public a: string,
          public b: string,
          public c: undefined
        ) {}
      }

      const instance = container.make(Test, [
        'foo',
        'bar'
      ]);

      expect(instance.a).toBe('foo');
      expect(instance.b).toBe('bar');
      expect(instance.c).toBeUndefined();
    });

    it('should create injectables that are missing constructor declarations', () => {
      @Injectable()
      class Foo {}

      expect(container.make(Foo)).toBeInstanceOf(Foo);
    });

    it('should resolve dependencies if class inherits from another Injectable()', () => {
      class DepA {}
      class DepB {}
      class DepC {}

      container.bind(DepA, new DepA());
      container.bind(DepB, new DepB());
      container.bind(DepC, new DepC());

      @Injectable()
      class A {
        constructor(public b: DepB, readonly c: DepC) {}
      }

      @Injectable()
      class B extends A {
        constructor(public a: DepA, b: DepB, c: DepC) {
          super(b, c);
        }
      }

      const ca = container.make(A);
      const cb = container.make(B);

      expect(cb.a).toBeInstanceOf(DepA);
      expect(cb.b).toBeInstanceOf(DepB);
      expect(cb.c).toBeInstanceOf(DepC);

      expect(ca.b).toBeInstanceOf(DepB);
      expect(ca.c).toBeInstanceOf(DepC);
    });
  });
});
