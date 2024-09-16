import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { PackedSprite, PackedSpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { AsepriteData, AsepriteFrameData } from './file-format';


/** @internal */
function createPackedSprite(data: AsepriteFrameData): PackedSprite {
  const frame = new PackedSprite(
    data.frame.x,
    data.frame.y,
    data.frame.w,
    data.frame.h
  );

  frame.source.x = data.spriteSourceSize.x;
  frame.source.y = data.spriteSourceSize.y;

  frame.source.height = data.sourceSize.h;
  frame.source.width = data.sourceSize.w;

  return frame;
}

/**
 * Asset loader {@link Format} that loads sprite-sheets exported by aseprite.
 *
 * Supports both "Hash" and "Array" outputs.
 *
 * - File extension: `.aseprite.json`.
 *
 * ## Usage
 *
 * Add the `AsepriteFormat` to your `AssetsBundle`. The format will now load all files
 * with the extension `.aseprite.json`.
 *
 * ```ts
 *  runtime()
 *    .bundle(
 *      new AssetsBundle()
 *        .use(new AsepriteFormat())
 *    )
 * ```
 *
 * ## Animations
 *
 * As individual frame durations are not supported by the animation system, the frame
 * duration for the entire animation is defined by the duration of its first frame.
 */
export class AsepriteFormat implements Format<AsepriteData, PackedSpriteSheet> {

  /** @inheritDoc */
  public readonly extensions = ['aseprite.json'];

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @internal */
  protected getTexture(file: string, loader: AssetLoader, image: string): Promise<Texture> {
    return loader.fetch(getDirectory(file, image));
  }

  /** @inheritDoc */
  public async process(data: AsepriteData, file: string, loader: AssetLoader): Promise<PackedSpriteSheet> {
    const texture = await this.getTexture(file, loader, data.meta.image);
    const collection = new PackedSpriteSheet(texture);

    let i = 0;
    let frameData: AsepriteFrameData[] = [];

    if (Array.isArray(data.frames)) {
      frameData = data.frames;

      for (let l = data.frames.length; i < l; i++) {
        collection.setPackedSprite(i, createPackedSprite(data.frames[i]));
      }
    }
    else {
      for (const name in data.frames) {
        const frame = data.frames[name];

        collection.setPackedSprite(i, createPackedSprite(frame));

        frameData.push(frame);

        i++;
      }
    }

    // Convert frame tags to animations.
    for (const tag of data.meta.frameTags) {
      const frames = [];

      let frameDuration = 100;

      for (let i = tag.from; i < (tag.to + 1); i++) {
        frames.push(i);

        // The animation system currently doesn't support individual frame durations,
        // so the frame duration for the entire animation is decided by the first frame
        // in an animation.
        if (i === tag.from) {
          frameDuration = frameData[i].duration;
        }
      }

      collection.setAnimation(tag.name, {
        frameDuration,
        frames
      });
    }

    return collection;
  }

}
