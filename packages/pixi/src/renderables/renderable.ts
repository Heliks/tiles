import { DisplayObject } from 'pixi.js';


/** Something that can be displayed by the renderer. */
export type Renderable = DisplayObject;

// Re-export PIXI renderables for which we don't have a custom type.
export {
  AnimatedSprite,
  Graphics,
  Sprite
} from 'pixi.js';
