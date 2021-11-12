import { Text } from 'pixi.js';


export class DrawText {

  public dirty = true;
  public view = new Text('', {fontFamily: 'Arial', fontSize: 24, fill: 0xFF1010, align: 'center'});

  constructor(public text = 'Hello World') {}

}
