import { UiText } from '@heliks/tiles-ui';
import { TextStyle as Base } from 'pixi.js';


export class TextStyle extends Base {

  constructor(color = 0x000000, fontSize = 10, fontFamily = UiText.defaultFont) {
    super({ fill: color, fontFamily, fontSize });
  }
  
}
