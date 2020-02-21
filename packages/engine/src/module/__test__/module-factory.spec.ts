import 'reflect-metadata';
import { Container } from '@tiles/injector';
import { ModuleDesc } from '../meta';
import { ModuleFactory } from '../module-factory';

describe('ModuleFactory', () => {
  let factory: ModuleFactory;

  // Empty module.
  class NoopModule {}

  beforeEach(() => {
    factory = new ModuleFactory();
  });

  it('validate imports', () => {
    class Module1 {}
    class Module2 {}

    expect(() => {
      factory.validateImports({
        module: Module1,
        imports: [
          Module2
        ]
      });
    }).toThrow();
  });

  it('should create modules from data', () => {
    const module = factory.fromData({
      module: NoopModule
    });

    expect(module.module).toBeInstanceOf(NoopModule);
  });

  it('should create modules from classes decorated with @ModuleDesc()', () => {
    @ModuleDesc() class Foo {}

    expect(
      factory.fromClass(Foo).module
    ).toBeInstanceOf(Foo);
  });

  it('should boot provided services', () => {
    class ServiceA {}
    class ServiceB {}

    const module = factory.fromData({
      module: NoopModule,
      provides: [
        ServiceA,
        ServiceB
      ]
    });

    expect(module.container.get(ServiceA)).toBeInstanceOf(ServiceA);
    expect(module.container.get(ServiceB)).toBeInstanceOf(ServiceB);
  });

  it('should throw if the same module is created twice', () => {
    // This should cache the NoopModule, so that when we call create() a second
    // time it throws the error. Other module options are irrelevant for this as
    // the module class services as the unique identifier.
    factory.fromData({
      module: NoopModule
    });

    expect(() => {
      factory.fromData({
        module: NoopModule
      });
    }).toThrow();
  });

  it('should provide custom providers to module', () => {
    const module = factory.fromData({
      module: NoopModule,
      provides: [
        { token: 'A', value: 'foo' },
        { token: 'B', value: 'bar' }
      ]
    });

    expect(module.container.get('A')).toBe('foo');
    expect(module.container.get('B')).toBe('bar');
  });

  it('should export services', () => {
    class ServiceA {}
    class ServiceB {}

    const container = new Container();

    container
      .instance(new ServiceA())
      .instance(new ServiceB())
      .bind('foo', 'bar');

    // Export ServiceA to the global container.
    factory.export(container, [
      ServiceA
    ]);

    const bindings = factory.container.getBindings();

    // ServiceB was not exported so it should not be
    // available for other modules.
    expect(bindings.has(ServiceB)).toBeFalsy();

    // The custom provided symbol "foo" shouldn't be
    // available either.
    expect(bindings.has('foo')).toBeFalsy();

    // Service should be available.
    expect(bindings.has(ServiceA)).toBeTruthy();
  });

});








