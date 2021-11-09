import { DisplayObject } from 'pixi.js';

/** An object that can be drawn by the renderer. */
export interface Drawable extends DisplayObject {
  /** Height in px. */
  height: number;
  /** Width in px. */
  width: number;
}
