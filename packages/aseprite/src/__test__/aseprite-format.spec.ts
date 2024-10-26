import { AssetLoader, AssetStorage, Fetch } from '@heliks/tiles-assets';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { AsepriteFormat } from '../aseprite-format';


class AsepriteFormatMock extends AsepriteFormat {

  /** @inheritDoc */
  protected getTexture(): Promise<Texture> {
    return Promise.resolve(Texture.WHITE);
  }

}

describe('AsepriteFormat', () => {
  let format: AsepriteFormat;
  let loader: AssetLoader;

  beforeEach(() => {
    format = new AsepriteFormatMock();
    loader = new AssetLoader(new AssetStorage(), new Fetch());
  });

  function parse(file: string): Promise<SpriteSheet> {
    return format.process(require(file), './', loader);
  }

  it.each([
    './output-array.json',
    './output-hash.json'
  ])('should parse file', async (file) => {
    expect(
      await parse(file)
    ).toBeInstanceOf(SpriteSheet)
  })

  it.each([
    './output-array.json',
    './output-hash.json'
  ])('should parse frame duration of animation "tag2" in %s', async (file) => {
    const spritesheet = await parse(file);
    const animation = spritesheet.getAnimation('tag2');

    expect(animation.frameDuration).toBe(150);
  });
});
