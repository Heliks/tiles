import { Container } from '@tiles/injector';
import { ClassType } from '@tiles/common';
import { Module, ModuleData } from './types';
import { getModuleMetadata } from './meta';

export class ModuleFactory {

  /** Cache of all modules that were created by this factory. */
  protected readonly modules = new Map<ClassType<unknown>, Module>();

  /**
   * @param container The service container that will be used to build
   *  all module dependencies like Providers, Systems etc.
   */
  constructor(public readonly container = new Container()) {}

  /**
   * Validates the dependencies of the given module `data`. Throws an error
   * if the validation fails.
   */
  public validateImports(data: ModuleData): void {
    if (data.imports) {
      // A single missing dependency fails the validation.
      for (const dependency of data.imports) {
        if (!this.modules.has(dependency)) {
          throw new Error(`${data.module.constructor.name} is missing\
          dependency ${dependency.constructor.name}`);
        }
      }
    }
  }

  /**
   * Exports all bindings in `exports` from the container `source` to the global
   * `container`. Throws an error if one of the exports is not bound to the given
   * source container.
   */
  public export(source: Container, exports: ClassType<unknown>[]): void {
    const bindings = source.getBindings();

    for (const service of exports) {
      if (bindings.has(service)) {
        // Copy value over to global container.
        this.container.bind(service, bindings.get(service));
      }
      else {
        throw new Error(`${service.constructor.name} is not provided.`);
      }
    }
  }

  /** Creates a module from the given `data`. */
  public fromData(data: ModuleData): Module {
    // Make sure that all dependencies of this module are in place.
    this.validateImports(data);

    // Don't allow the same module to be created more than once.
    if (this.modules.has(data.module)) {
      throw new Error(`Module ${data.module.constructor.name} already exists`);
    }

    // Each module gets its own private container so that we can attach bindings
    // scoped to a certain module without the side-effect of passing something
    // down to the next module that we don't want.
    const container = new Container().merge(this.container);

    // Instantiate and bind providers.
    if (data.provides) {
      for (const item of data.provides) {

        if (typeof item === 'function') {
          container.instance(container.make(item));
        }
        // Custom provider
        else {
          container.bind(
            item.token,
            item.value
          );
        }
      }
    }

    // Export providers to the global container.
    if (data.exports) {
      this.export(container, data.exports);
    }

    const module = {
      container,
      module: container.make(data.module)
    };

    // Cache module.
    this.modules.set(data.module, module);

    return module;
  }

  /**
   * Creates a module from the given class `module`. Throws an error if fhe class
   * is not decorated with `@ModuleDesc()`.
   */
  public fromClass(module: ClassType<unknown>): Module {
    const meta = getModuleMetadata(module);

    if (!meta) {
      throw new Error('Module classes must be tagged with @ModuleDesc()');
    }

    return this.fromData({
      module: module, ...(meta)
    });
  }

  /**
   * Creates a module.
   *
   * @see fromClass
   * @see fromData
   */
  public create(module: ModuleData | ClassType<unknown>) {
    return typeof module === 'function'
      ? this.fromClass(module)
      : this.fromData(module);
  }

  /** Returns a readonly version of {@link modules}. */
  public getModules(): ReadonlyMap<ClassType<unknown>, Module> {
    return this.modules;
  }

}
