import { BitmapFont, BitmapText } from 'pixi.js';
import { TextStyle } from './style';


export interface ResolvedTextStyle {
  fontName: string;
  fontSize: number;
  tint: number;
  align: 'left';
  letterSpacing: number;
  maxWidth: number;
}


/** Application text defaults and resolution of installed bitmap fonts. */
export class Fonts {

  /**
   * @param defaults 
   */
  constructor(public defaults: TextStyle = {}) {}

  /**
   * Returns a font used to render text. If no `name` is provided, the applications'
   * default font will be returned.
   */
  private font(name?: string): BitmapFont {
    const family = name ?? this.defaults.fontFamily;

    if (! family) {
      throw new Error('No font is loaded.');
    }

    const font = BitmapFont.available[family];

    if (! font) {
      throw new Error(`Font "${family}" is not loaded.`);
    }

    return font;
  }

  /** Resolves a style for initial creation. Allocates one style object. */
  public resolve(style?: TextStyle): ResolvedTextStyle {
    const font = this.font(style?.fontFamily);

    return {
      fontName: font.font,
      fontSize: style?.fontSize ?? this.defaults.fontSize ?? font.size,
      tint: style?.color ?? this.defaults.color ?? 0xffffff,
      align: 'left',
      letterSpacing: 0,
      maxWidth: 0
    };
  }

  /** Applies current defaults and node style without allocating a style object. */
  public apply(target: BitmapText, style: TextStyle = this.defaults): void {
    const font = this.font(style.fontFamily);

    // Pixi's setters already ignore unchanged values.
    target.fontName = font.font;
    target.fontSize = style.fontSize ?? this.defaults.fontSize ?? font.size;
    target.tint = style.color ?? this.defaults.color ?? 0xffffff;
  }

  /** Creates bitmap text using this application's defaults. */
  public text(value: string, style?: TextStyle): BitmapText {
    return new BitmapText(value, this.resolve(style));
  }

}
