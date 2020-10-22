import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteCollection, Texture, TextureFormat } from '@heliks/tiles-pixi';
import { AsepriteData } from './json';

/** @internal */
function getTexture(file: string, loader: AssetLoader, image: string): Promise<Texture> {
  return loader.fetch(`${getDirectory(file)}/${image}`, new TextureFormat());
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

      collection.setFrame(
        i,
        frameData.frame.x,
        frameData.frame.y,
        frameData.frame.w,
        frameData.frame.h
      );
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
