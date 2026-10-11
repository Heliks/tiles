import { AssetLoader, Format, LoadType } from '@heliks/tiles-assets';
import { BitmapFont, Texture } from 'pixi.js';


/** Asset loader format to load bitmap fonts with a PNG of the same name. */
export class LoadFont implements Format<string, BitmapFont, AssetLoader> {

  /** @inheritDoc */
  public readonly extensions = ['fnt'];

  /** @inheritDoc */
  public readonly type = LoadType.Text;

  /** @inheritDoc */
  public async process(data: string, file: string, loader: AssetLoader): Promise<BitmapFont> {
    const font = data.trim().startsWith('<')
      ? new DOMParser().parseFromString(data, 'text/xml')
      : data;

    const texture = await loader.fetch<Texture>(
      file.replace(/\.fnt$/, '.png')
    );

    return BitmapFont.install(font, texture);
  }

}
