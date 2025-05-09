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

  /**
   * Color in which the text is filled. Can be filled with a gradient by specifying
   * multiple colors.
   */
  color?: number | number[];

  /**
   * Defines the points where the text {@link color colors} will fade into each other
   * when multiple colors are specified.
   */
  colorStops?: number[];

  /** Text size in px. */
  fontSize?: number;

  /** Name of the font family that should be used to render this text. */
  fontFamily?: string;

  /**
   * Device pixel ratio of the canvas where the text is being rendered. This is set
   * automatically to match the renderer resolution by default, but can be overwritten
   * by setting it manually. The default resolution is `1`.
   */
  resolution?: number;

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
   * Amount of rotation that is applied to the node around its {@link pivot}. The
   * rotation is measured in radians. Positive values will rotate the node clockwise,
   * and negative values, counter-clockwise.
   */
  rotation?: number;

  /**
   * Sets the point around which transformations are applied to the node. For example,
   * when applying a {@link rotation}, this is the point around which it rotates. The
   * pivot should be a percentage value between `0` and `1`.
   *
   * Functionally this is the replacement for the CSS transform origin.
   *
   * ```ts
   *  style.pivot = new Vec(0, 0);      // Top-left
   *  style.pivot = new Vec(0.5, 0.5);  // Center
   *  style.pivot = new Vec(1, 1);      // Bottom-right
   * ```
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin
   */
  pivot?: Vec2;

  /**
   * Defines how text should be rendered.
   *
   * Details of how this style is used may depend on the individual implementation of
   * the element that renders the text.
   */
  text?: TextStyle;

}
