import { Struct, Vec2 } from '@tiles/engine';
import * as PIXI from 'pixi.js'
import { DisplayObject, Rectangle, Renderer, Texture } from 'pixi.js'
import { RendererConfig } from "./config";
import { Format, ImageFormat, LoadType } from "@tiles/assets";

/** Reads a `Blob` and produces image nodes. */
export class TextureFormat implements Format<Blob, Texture> {

  /** {@inheritDoc} */
  public readonly name = 'PIXI:texture';

  /** {@inheritDoc} */
  public readonly type = LoadType.Blob;

  /** {@inheritDoc} */
  public process(data: Blob): Texture {
    // Todo: always creating a new image format instance is probably a bad idea.
    return Texture.from(new ImageFormat().process(data));
  }

}

/** Crops a texture. */
export function cropTexture(
  source: Texture,
  pos: Vec2,
  size: Vec2
): PIXI.Texture {
  return new Texture(source.baseTexture, new Rectangle(
    pos[0],
    pos[1],
    size[0],
    size[1]
  ));
}

/**
 * Converts `r` (red), `g` (green) and `b` (blue) to a hex number. All rgb
 * values are assumed to be normalized between `0` and `1`
 */
export function rgb2hex(r: number, g: number, b: number): number {
  return ((r * 255) << 16) + ((g * 255) << 8) + (b * 255 | 0);
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


/** Directions in which a renderable object can be flipped. */
export enum FlipDirection {
  None,
  Both,
  Horizontal,
  Vertical
}

/** Flips a `renderable` in the given `direction`. */
export function flip(
  renderable: DisplayObject,
  direction: FlipDirection
): void {
  switch (direction) {
    case FlipDirection.None:
      renderable.scale.x = 1;
      renderable.scale.y = 1;
      break;
    case FlipDirection.Both:
      renderable.scale.x = -1;
      renderable.scale.y = -1;
      break;
    case FlipDirection.Horizontal:
      renderable.scale.x = -1;
      renderable.scale.y = 1;
      break;
    case FlipDirection.Vertical:
      renderable.scale.y = -1;
      renderable.scale.y = 1;
      break;
  }
}

/** Initializes a PIXI renderer from the `config`. */
export function initPixi(config: RendererConfig): Renderer {
  const _config: Struct = {
    transparent: config.transparent ?? true
  };

  if (config.transparent) {
    _config.transparent = true;
  }
  else {
    // By default render the background as black.
    _config.backgroundColor = config.background ?? 0x0;
  }

  if (config.antiAlias) {
    _config.antialias = true;
  }
  else {
    // Prevent sub-pixel smoothing when anti aliasing is disabled.
    // Fixme: figure out if this can be somehow set on the renderer without
    //  setting it globally as it forces two games running on the same page
    //  to use the same scale mode.
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    _config.antialias = false;
  }

  return new Renderer(_config);
}

