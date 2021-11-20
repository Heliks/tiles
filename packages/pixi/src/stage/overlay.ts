import { Container } from '../drawable';


/**
 * The overlay is a container with its size and position fixed to the screen. In the
 * render hierarchy it is on top of the stage. Unlike the latter the overlay is not
 * scaled to resolution or zoom factor unless it is done so manually. This makes it
 * the perfect place to render UI elements to.
 *
 * @see Stage
 */
export class Overlay extends Container {}
