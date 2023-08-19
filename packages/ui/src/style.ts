import { LayerId } from '@heliks/tiles-pixi';
import { Style as BaseStyle } from './layout';
import { UiAlign } from './ui-node';


/** @inheritDoc */
export interface Style extends BaseStyle {

  /**
   * Id of the renderer {@link LayerId layer} where the node should be rendered.
   *
   * If not defined, the node will be rendered on the first layer available. If the node
   * is the child of another node, this setting will be ignored.
   */
  layer?: LayerId;

  /**
   * Specifies if the node should be aligned to the screen or the game world.
   *
   * @see UiAlign
   */
  space?: UiAlign;

}