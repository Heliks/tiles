import { Injectable } from '@heliks/tiles-engine';
import { Container } from '../drawable';


/**
 * Contains all game objects.
 *
 * Everything rendered here is scaled appropriately according to resolution and zoom
 * factor, which means that if we have a 200x200px screen with 100x100px resolution a
 * 20x20px `Drawable` would be scaled to the appropriate size of `40x40px`.
 *
 * @see Overlay
 * @see Renderer
 */
@Injectable()
export class Stage extends Container {}


