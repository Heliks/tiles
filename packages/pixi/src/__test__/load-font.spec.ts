import { AssetLoader } from '@heliks/tiles-assets';
import { BitmapFont, Texture } from 'pixi.js';
import { LoadFont } from '../load-font';


describe('LoadFont', () => {
  const data = `info face="Test" size=16
common lineHeight=18
page id=0 file="test.png"
chars count=0`;

  let fetch: jest.Mock;
  let loader: AssetLoader;

  beforeEach(() => {
    fetch = jest.fn().mockResolvedValue(Texture.WHITE);
    loader = {fetch} as unknown as AssetLoader;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (BitmapFont.available.Test) {
      BitmapFont.uninstall('Test');
    }
  });

  it('loads the PNG beside the font', async () => {
    await new LoadFont().process(data, 'fonts/test.fnt', loader);

    expect(fetch).toHaveBeenCalledWith('fonts/test.png');
  });

  it('installs the font in Pixi', async () => {
    const font = await new LoadFont().process(data, 'fonts/test.fnt', loader);

    expect(BitmapFont.available.Test).toBe(font);
  });

  it('installs an XML font in Pixi', async () => {
    // jsdom parses XML as Document; Pixi expects an XMLDocument.
    const parse = DOMParser.prototype.parseFromString;

    jest.spyOn(DOMParser.prototype, 'parseFromString').mockImplementation((source, type) => {
      const xml = parse.call(new DOMParser(), source, type);

      Object.setPrototypeOf(xml, XMLDocument.prototype);

      return xml;
    });

    const font = await new LoadFont().process(`<?xml version="1.0"?>
<font>
  <info face="Test" size="16"/>
  <common lineHeight="18"/>
  <pages><page id="0" file="test.png"/></pages>
  <chars count="0"/>
</font>`, 'fonts/test.fnt', loader);

    expect(BitmapFont.available.Test).toBe(font);
  });
});
