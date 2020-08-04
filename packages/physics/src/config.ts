import { token } from '@heliks/tiles-engine';

/** Configuration for physics module. */
export interface PhysicsConfig {
  /**
   * The size in pixels that equals a measurement unit (pixel to meter ratio). For
   * example if this contains the value `16`, the physics engine will treat 16px as
   * equal to one meter.
   */
  unitSize: number;
}

/** The token used to provide the physics config to the service container.*/
export const TK_PHYSICS_CONFIG = token<PhysicsConfig>();

/**
 * Parses a partial physics `config` and fills it with fallback values where
 * appropriate.
 */
export function parseConfig(config: Partial<PhysicsConfig>): PhysicsConfig {
  return {
    unitSize: 16,
    ...config
  };
}

