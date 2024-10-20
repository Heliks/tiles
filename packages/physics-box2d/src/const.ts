import { b2World } from '@heliks/box2d';
import { EventQueue, token, XY } from '@heliks/tiles-engine';


/** Event that occurs when a raycast is performed. */
export interface RaycastEvent {
  /** Start point of the casted ray. */
  start: XY,
  /** End point of the casted ray. */
  end: XY
}

/** Event queue for raycasts. */
export type RaycastQueue = EventQueue<RaycastEvent>;

export const B2_RAYCASTS = token<RaycastQueue>();
export const B2_WORLD = token<b2World>();
