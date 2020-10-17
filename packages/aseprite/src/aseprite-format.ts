import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteCollection, TextureFormat } from '@heliks/tiles-pixi';
import { Rectangle } from '@heliks/tiles-engine';

function getTexture(file: string, loader: AssetLoader, image: string) {
  return loader.fetch(`${getDirectory(file)}/${image}`, new TextureFormat());
}

export interface AsepriteRectangle {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface AsepriteFrameTag {
  name: string;
  from: number;
  to: number;
}

export interface AsepriteFrameData {
  duration: number;
  frame: AsepriteRectangle;
}

export interface AsepriteMetaData {
  image: string;
  frameTags: AsepriteFrameTag[];
}

export interface AsepriteData {
  frames: AsepriteFrameData[];
  meta: AsepriteMetaData;
}

/**
 * A format to load sprite sheets exported with Aseprite.
 * Note: The meta option `Array` must be selected when exporting the sprite sheet.
 */
export class AsepriteFormat implements Format<AsepriteData, SpriteCollection> {

  /** @inheritDoc */
  public readonly name = 'PIXI:aseprite';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: AsepriteData, file: string, loader: AssetLoader): Promise<SpriteCollection> {
    const texture = await getTexture(file, loader, data.meta.image);
    const collection = new SpriteCollection(texture);

    for (let i = 0, l = data.frames.length; i < l; i++) {
      const frameData = data.frames[i];

      collection.setFrame(i, new Rectangle(
        frameData.frame.w,
        frameData.frame.h,
        frameData.frame.x,
        frameData.frame.y
      ));
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
