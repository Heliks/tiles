import { World } from '@heliks/tiles-engine';
import { Node } from './jsx';


/**
 * Implementation of a UI component.
 *
 * ## Lifecycle
 *
 *
 * Ui components can implement {@link OnInit}.
 */
export interface UiComponent {

  render(world: World): Node<UiComponent>;

}
