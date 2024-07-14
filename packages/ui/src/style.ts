import { Style as BaseStyle } from '@heliks/flex';
import { Vec2 } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';


/** Defines the context to which {@link UiNode nodes} are aligned to. */
export enum DisplayContext {
  /** Ui elements are aligned to the in-game world. All pixel values are treated as game-units. */
  World,
  /** Ui elements are aligned to the screen. */
  Screen
}

export interface TextStyle {

  /** Defines the color of the text border. */
  borderColor?: number;

  /** Defines the width of the text border */
  borderWidth?: number;

  /** Text color. */
  color?: number;

  /** Text size in px. */
  fontSize?: number;

  /** Name of the font family that should be used to render this text. */
  fontFamily?: string;

  /**
   * If enabled, the text will wrap when it takes more space than available.
   *
   * This does not take the size into account that adjacent child nodes to the text might
   * occupy, hence why wrapping text should be placed in its own element that defines the
   * boundaries by which it should wrap.
   */
  wrap?: boolean;

}


/** @inheritDoc */
export interface Style extends BaseStyle {

  // Todo: Remove this maybe?
  position?: Vec2;

  /**
   * Specifies the context in which the node should be rendered. If the node is the child
   * of another node, this setting will be ignored.
   */
  context?: DisplayContext;

  /**
   * ID of the renderer layer where the node should be rendered. If not defined, the node
   * will be rendered on the first layer available. If the node is the child of another,
   * this setting will be ignored.
   */
  layer?: LayerId;

  /**
   * Defines the opacity in which the node is rendered in a range from 0 to 1. By default,
   * nodes will be rendered with an opacity of 1.
   */
  opacity?: number;

  /**
   * Defines how text should be rendered.
   *
   * Details of how this style is used may depend on the individual implementation of
   * the element that renders the text.
   */
  text?: TextStyle;

}
