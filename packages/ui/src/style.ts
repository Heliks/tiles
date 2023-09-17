import { LayerId } from '@heliks/tiles-pixi';
import { Style as BaseStyle } from './layout';


/** Defines the context to which {@link UiNode nodes} are aligned to. */
export enum DisplayContext {
  /** Ui elements are aligned to the in-game world. All pixel values are treated as game-units. */
  World,
  /** Ui elements are aligned to the screen. */
  Screen
}

/** @inheritDoc */
export interface Style extends BaseStyle {

  /**
   * Specifies the context in which the node should be rendered. If the node is the child
   * of another node, this setting will be ignored.
   *
   * @see DisplayContext
   */
  context?: DisplayContext;

  /**
   * Id of the renderer {@link LayerId layer} where the node should be rendered.
   *
   * If not defined, the node will be rendered on the first layer available. If the node
   * is the child of another node, this setting will be ignored.
   */
  layer?: LayerId;

}
