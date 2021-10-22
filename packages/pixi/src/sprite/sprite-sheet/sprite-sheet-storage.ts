import { AssetStorage } from '@heliks/tiles-assets';
import { SpriteSheet } from './sprite-sheet';


/** Stores sprite sheets. */
export class SpriteSheetStorage extends Map implements AssetStorage<SpriteSheet> {}
