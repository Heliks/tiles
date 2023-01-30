import { Bundle as BaseBundle } from './bundle';
import { AppBuilder } from './app-builder';


export * from './app';
export * from './app-builder';
export * from './lifecycle';
export * from './provider';
export * from './state'
export * from './ticker';

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
 */
export function runtime(): AppBuilder {
  return new AppBuilder();
}
