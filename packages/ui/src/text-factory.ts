import { Text, TextStyle as PixiText } from 'pixi.js';
import { TextStyle } from './style';


/** Utility to parse {@link TextStyle text styles} to be compatible with PIXI. */
export class TextFactory {

  public parse(style: TextStyle, target: Partial<PixiText> = {}): Partial<PixiText> {
    target.fill = style.color;
    target.fillGradientStops = style.colorStops;
    target.fontSize = style.fontSize;

    if (style.fontFamily) {
      target.fontFamily = style.fontFamily;
    }
    
    if (style.borderWidth !== undefined && style.borderColor !== undefined) {
      target.stroke = style.borderColor;
      target.strokeThickness = style.borderWidth;
      target.lineJoin = 'miter';
    }

    return target;
  }

  /** Creates a {@link Text} with the given `style`. */
  public create(value: string, style: TextStyle): Text {
    const text = new Text(value, this.parse(style));

    if (style.resolution) {
      text.resolution = style.resolution;
    }

    return text;
  }

}
