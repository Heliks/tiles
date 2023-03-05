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
 * Asset loader {@link Format} that loads spritesheets exported by aseprite. Supports
 * both "Hash" and "Array" outputs.
 *
 * Note: This does *not* load aseprite project file types (e.g. `.aseprite` files).
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

    if (Array.isArray(data.frames)) {
      for (let l = data.frames.length; i < l; i++) {
        collection.setPackedSprite(i, createPackedSprite(data.frames[i]));
      }
    }
    else {
      for (const name in data.frames) {
        if (data.frames.hasOwnProperty(name)) {
          collection.setPackedSprite(i, createPackedSprite(data.frames[name]));

          i++;
        }
      }
    }

    // Convert frame tags to animations.
    for (const tag of data.meta.frameTags) {
      const frames = [];

      for (let i = tag.from; i < (tag.to + 1); i++) {
        frames.push(i);
      }

      collection.setAnimation(tag.name, {
        frames
      });
    }

    return collection;
  }

}
