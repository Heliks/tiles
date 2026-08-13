import { Text, TextStyle } from 'pixi.js';


export type FontConfig = Partial<TextStyle>;

export class Fonts {

  /**
   * Contains the name of the font used as default when none is specified when
   * creating text.
   */
  public default = 'default';

  private readonly fonts = new Map<string, FontConfig>();

  public text(text: string, family?: string): Text {
    const view = new Text(text, this.font(family ?? this.default));

    // Todo: This is probably higher than we need for most scale factors. If we
    //  adjust this dynamically we can save a little bit of performance.
    view.resolution = 4;

    return view;
  }

  public set(family: string, config: FontConfig): this {
    this.fonts.set(family, config);

    return this;
  }

  /** Returns the text style definition for the given font `family`. */
  public font(family: string): FontConfig {
    const style = this.fonts.get(family);

    if (! style) {
      throw new Error(`Invalid font "${family}".`);
    }

    return style;
  }


}
