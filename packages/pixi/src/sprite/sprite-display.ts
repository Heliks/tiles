import { Handle } from '@tiles/assets';
import { SpriteSheet } from './sprite-sheet';


export class SpriteDisplay {

  public dirty = true;

  constructor(
    public sheet: SpriteSheet,
    public id: number
  ) {}

}

