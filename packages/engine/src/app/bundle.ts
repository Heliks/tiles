import { Builder } from './builder';


/**
 * A bundle is a collection of builder tasks that are grouped together.
 *
 * Essentially they are modules for the game builder. Bundles do *not* run in a sandbox,
 * which means that resources, systems, etc. will bleed into the {@link World} as if
 * they were added outside a bundle.
 *
 * Bundles can implement the {@link OnInit} lifecycle.
 *
 * ### Example
 *
 * The example below demonstrates a bundle that registers a provider & a system.
 *
 * ```ts
 *  class MyBundle implements Bundle<AppBuilder> {
 *
 *    public build(builder: AppBuilder): void {
 *      // Adds additional builder tasks.
 *      builder
 *        .provide(MyProvider)
 *        .system(MySystem);
 *    }
 *
 *  }
 * ```
 */
export interface Bundle<B extends Builder> {

  /**
   * Implementation of the bundle build logic.
   *
   * If this bundle was added as a build task to the `AppBuilder`, this function will
   * be called during the game runtime build process.
   */
  build(app: B): void;

}
