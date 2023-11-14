import { getStorageInjectorToken } from '../../ecs';
import { App } from '../app';
import { AppBuilder } from '../app-builder';


describe('AppBuilder', () => {
  it('should build a app', () => {
    expect(new AppBuilder().build()).toBeInstanceOf(App);
  });

  describe('components', () => {
    // Test component.
    class Foo {}
    class Bar {}

    it('should bind storages to the service container', () => {
      // Test component.
      class Foo {}

      // Try to resolve storage from service container.
      const storage = new AppBuilder()
        .component(Foo)
        .build()
        .world.get(getStorageInjectorToken(Foo));

      expect(storage.type).toBe(Foo);
    });
  });

  describe('providers', () => {
    it('should register class providers', () => {
      class Provider1 {}
      class Provider2 {}

      const container = new AppBuilder()
        .provide(Provider1)
        .provide(Provider2)
        .build()
        .container;

      expect(container.get(Provider1)).toBeInstanceOf(Provider1);
      expect(container.get(Provider2)).toBeInstanceOf(Provider2);
    });

    it('should register value providers', () => {
      const container = new AppBuilder()
        .provide('1', 'foo')
        .provide('2', 'bar')
        .build()
        .container;

      expect(container.get('1')).toBe('foo');
      expect(container.get('2')).toBe('bar');
    });

    // Factory providers.
    describe('factories', () => {
      let counter = 0;

      beforeEach(() => {
        // Reset the counter on each test run.
        counter = 0;
      });

      /** Returns an incremented version of `counter`. */
      function factory(): number {
        return ++counter;
      }

      it('should be bound as factory', () => {
        const app = new AppBuilder().factory('counter', factory).build();

        expect(app.container.get('counter')).toBe(1);
        expect(app.container.get('counter')).toBe(2);
      });

      it('should be bound as singleton', () => {
        const app = new AppBuilder().singleton('counter', factory).build();

        expect(app.container.get('counter')).toBe(1);
        expect(app.container.get('counter')).toBe(1);
      });
    });
  });

  describe('modules', () => {
    it('should register provider', () => {
      class TestService {}

      const app = new AppBuilder()
        .bundle({
          build: builder => void builder.provide(TestService)
        })
        .build();

      // Check if the service provided via TestModule exists on the service container.
      expect(app.container.get(TestService)).toBeInstanceOf(TestService);
    });

    it('should call OnInit lifecycle hook', () => {
      const init = jest.fn();
      const app = new AppBuilder()
        .bundle({
          build: () => void 0,
          onInit: init
        })
        .build();

      expect(init).toHaveBeenCalledWith(app.world);
    });

    it('should call OnInit lifecycle hook on system provided by module', () => {
      const system = {
        update: () => void 0,
        onInit: jest.fn()
      };

      const app = new AppBuilder()
        .bundle({
          build: builder => void builder.system(system)
        })
        .build();

      expect(system.onInit).toHaveBeenCalledWith(app.world);
    })
  });

  it('should run boot script', () => {
    const builder = new AppBuilder();
    const callback = jest.fn();

    builder
      .run(callback)
      .build();

    expect(callback).toHaveBeenCalled();
  });
});
