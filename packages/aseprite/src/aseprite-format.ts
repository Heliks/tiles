import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteCollection, Texture, TextureFormat } from '@heliks/tiles-pixi';
import { AsepriteData, AsepriteFrameData, AsepriteFramesMap } from './json';

/** @internal */
function parseFramesMap(sprites: SpriteCollection, frames: AsepriteFramesMap): void {
  let i = 0;

  for (const name in frames) {
    if (frames.hasOwnProperty(name)) {
      const frameData = frames[name];

      sprites.setFrame(
        i,
        frameData.frame.x,
        frameData.frame.y,
        frameData.frame.w,
        frameData.frame.h
      );

      i++;
    }
  }
}

/** @internal */
function parseFramesArray(sprites: SpriteCollection, frames: AsepriteFrameData[]): void {
  for (let i = 0, l = frames.length; i < l; i++) {
    const frameData = frames[i];

    sprites.setFrame(
      i,
      frameData.frame.x,
      frameData.frame.y,
      frameData.frame.w,
      frameData.frame.h
    );
  }
}

/**
 * A format to load sprite sheets exported with Aseprite.
 *
 * Supports both "Hash" and "Array" outputs.
 */
export class AsepriteFormat implements Format<AsepriteData, SpriteCollection> {

  /** @inheritDoc */
  public readonly name = 'PIXI:aseprite';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @internal */
  protected getTexture(file: string, loader: AssetLoader, image: string): Promise<Texture> {
    return loader.fetch(`${getDirectory(file)}/${image}`, new TextureFormat());
  }

  /** @inheritDoc */
  public async process(data: AsepriteData, file: string, loader: AssetLoader): Promise<SpriteCollection> {
    const texture = await this.getTexture(file, loader, data.meta.image);
    const collection = new SpriteCollection(texture);

    if (Array.isArray(data.frames)) {
      parseFramesArray(collection, data.frames);
    }
    else {
      parseFramesMap(collection, data.frames);
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
