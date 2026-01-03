import { AppBuilder } from './app-builder';
import { Bundle as BaseBundle } from './bundle';


export * from './app';
export * from './app-builder';
export * from './schedule-builder';
export * from './state'
export * from './ticker';
export * from './timer';

export * from './tasks';

/** @see BaseBundle */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Bundle extends BaseBundle<AppBuilder> {}


/**
 * Returns a {@link AppBuilder} that is used to compose the {@link App} runtime. This
 * is the "starting point" of every game created with this engine.
 *
 * ```ts
 *  // Compose the game runtime.
 *  const game = runtime()
 *    .provider(MyProvider)
 *    .system(MySystem);
 *    .build();
 *
 *  // Start the game!
 *  game.start();
 * ```
 *
 * ### Providers
 *
 * Providers are services, resources or data structures that are globally accessible by
 * other parts of the runtime via the service container.
 *
 * There are multiple ways to add a provider, each with their own unique behavior:
 *
 * - {@link AppBuilder.provide}
 * - {@link AppBuilder.singleton}
 * - {@link AppBuilder.factory}
 */
export function runtime(): AppBuilder {
  return new AppBuilder();
}
