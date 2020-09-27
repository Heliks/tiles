import { DisplayObject } from 'pixi.js';

/** Something that can be displayed by the renderer. */
export interface Renderable extends DisplayObject {
  /** Height in px. */
  height: number;
  /** Width in px. */
  width: number;
}
