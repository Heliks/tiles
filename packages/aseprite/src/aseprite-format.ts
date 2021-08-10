import { AssetLoader, Format, getDirectory, Handle, LoadType } from '@heliks/tiles-assets';
import { Frame, SPRITE_SHEET_STORAGE, SpriteCollection, SpriteSheet, Texture, TextureFormat } from '@heliks/tiles-pixi';
import { AsepriteData, AsepriteFrameData } from './file-format';
import { World } from '@heliks/tiles-engine';

/** @internal */
function createFrame(data: AsepriteFrameData): Frame {
  const frame = new Frame(
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
 * Asset loader format that loads sprite-sheets exported from Aseprite.
 * Supports both "Hash" and "Array" outputs.
 */
export class AsepriteFormat implements Format<AsepriteData, SpriteCollection> {

  /** @inheritDoc */
  public readonly name = 'PIXI:aseprite';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** Utility method that uses the `AssetLoader` to load a `SpriteSheet` from `path`. */
  public static load(world: World, path: string): Handle<SpriteSheet> {
    return world
      .get(AssetLoader)
      .load(path, new AsepriteFormat(), world.get(SPRITE_SHEET_STORAGE));
  }

  /** @internal */
  protected getTexture(file: string, loader: AssetLoader, image: string): Promise<Texture> {
    return loader.fetch(`${getDirectory(file)}/${image}`, new TextureFormat());
  }

  /** @inheritDoc */
  public async process(data: AsepriteData, file: string, loader: AssetLoader): Promise<SpriteCollection> {
    const texture = await this.getTexture(file, loader, data.meta.image);
    const collection = new SpriteCollection(texture);

    let i = 0;

    if (Array.isArray(data.frames)) {
      for (let l = data.frames.length; i < l; i++) {
        collection.setFrame(i, createFrame(data.frames[i]));
      }
    }
    else {
      for (const name in data.frames) {
        if (data.frames.hasOwnProperty(name)) {
          collection.setFrame(i, createFrame(data.frames[name]));

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
