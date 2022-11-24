import { XY } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js'
import { Rectangle, Texture } from 'pixi.js'


/** Crops a texture. */
export function cropTexture(source: Texture, pos: XY, size: XY): PIXI.Texture {
  return new Texture(source.baseTexture, new Rectangle(pos.x, pos.y, size.x, size.y));
}

/**
 * Converts `r` (red), `g` (green) and `b` (blue) to a hex number. All rgb
 * values are assumed to be normalized between `0` and `1`
 */
export function rgb2hex(r: number, g: number, b: number): number {
  return ((r * 255) << 16) + ((g * 255) << 8) + (Math.trunc(b * 255));
}

/**
 * Converts `hex` to rgb and returns it as an an array.
 *
 * ```ts
 * const rgb = hex2rgb(0xFF0000);
 *
 * console.log(rgb[0]); // red
 * console.log(rgb[1]); // green
 * console.log(rgb[2]); // blue
 * ```
 */
export function hex2rgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

