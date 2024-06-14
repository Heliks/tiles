import { EventQueue, Pivot, PivotPreset } from '@heliks/tiles-engine';
import { Container } from 'pixi.js';
import { Display, Node } from './layout';
import { Style } from './style';
import { UiEvent } from './ui-event';


/** Possible interactions with {@link UiNode ui nodes}. */
export enum UiNodeInteraction {
  /** User is currently not interacting with this node. */
  None = 'none',
  /** Node is pressed down (e.g. mouse down, touch down) */
  Down = 'down',
  /** Node was released this frame (e.g. mouse up, touch up). */
  Up = 'up'
}

/**
 * Component that is attached to entities that are UI nodes. This is the lowest level
 * building block for higher level UI component composition.
 *
 * The unit in which the position is measured depends on the screen alignment. If it is
 * aligned to the screen, the position is measured in pixels. If it is aligned to the
 * world, it is measured in game units instead. Width and height are always measured
 * in pixels.
 *
 * If this node is a child of another node, the alignment is always inherited from the
 * parent, which means that it's not possible to render a child on screen while its
 * parent is rendered in the world.
 *
 * - `S`: Stylesheet type passed into the node.
 */
export class UiNode<S extends Style = Style> {

  /**
   * Container where the display objects of ui nodes that are children of this root
   * will be rendered in.
   */
  public readonly container = new Container();

  /**
   * Specifies a name for this node so that it can be referenced in code. This is
   * treated similarly to the HTML `name` attribute.
   */
  public name?: string;

  /**
   * Contains the current user interaction with this UI element. If interactions are
   * disabled the interaction will always be `Interaction.None`.
   *
   * @see interactive
   */
  public interaction = UiNodeInteraction.None;

  /**
   * If set to `true`, user interactions (a.E. click, hover, etc.) will be enabled for
   * this node. The current interaction can be read from {@link interaction}.
   */
  public interactive = false;

  /**
   * Receives an event when an {@link interaction} happens on this node.
   *
   * Events are propagated to parent nodes (event bubbling). This means that this queue
   * can receive events of child nodes, even if this node is not {@link interactive}
   * itself.
   */
  public onInteract = new EventQueue<UiEvent>();

  /**
   * Layout {@link Node}. Used for layout calculations when the UI node is part of
   * a formatting context. (e.g. applies a {@link Style stylesheet} to its children, or
   * has one applied via its parent).
   */
  public readonly layout: Node;

  /** Node pivot. This does not affect the pivot of child nodes. */
  public pivot: Pivot = PivotPreset.TOP_LEFT;

  /** The stylesheet that is applied to this node. */
  public readonly style: S;

  /**
   * @param style (optional) Style properties that should be applied to the node layout.
   */
  constructor(style?: Partial<S>) {
    this.layout = new Node(style);
    this.style = this.layout.style as S;
  }

  /** Shows the container. */
  public show(): this {
    this.container.visible = true;

    return this;
  }

  /** Hides the container. Hidden nodes will still be updated, but not drawn. */
  public hide(): this {
    this.container.visible = false;

    return this;
  }

  public visible(): boolean {
    return this.style.display !== Display.None;
  }

  public hidden(): boolean {
    return this.style.display === Display.None;
  }

}

