import { Container } from 'pixi.js';
import { EventQueue, World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { Pivot, PivotPreset } from '@heliks/tiles-engine';
import { UiWidget } from './ui-widget';
import { Interaction, InteractionEvent } from './interaction-event';


/** Defines the context to which {@link UiNode nodes} are aligned to. */
export enum UiAlign {
  World,
  Screen
}



/**
 * Component that is attached to entities that are UI nodes. This is the lowest level
 * building block for higher level UI component composition.
 *
 * The unit in which the position is measured depends on the {@link align alignment}. If
 * it is aligned to the screen, the position is measured in pixels. If it is aligned to
 * the world, it is measured in game units instead. Width and height are always measured
 * in pixels.
 *
 * If this node is a child of another node, the alignment is always inherited from the
 * parent, which means that it's not possible to render a child on screen while its
 * parent is rendered in the world.
 *
 * - `W`: Kind of widget that can be attached to this node.
 */
export class UiNode<W extends UiWidget = UiWidget> {

  /**
   * Container where the display objects of ui nodes that are children of this root
   * will be rendered in.
   */
  public readonly container = new Container();

  /**
   * Contains the current user interaction with this UI element. If interactions are
   * disabled the interaction will always be `Interaction.None`.
   *
   * @see interactive
   */
  public interaction = Interaction.None;

  /**
   * If set to `true`, user interactions (a.E. click, hover, etc.) will be enabled for
   * this widget. The current interaction can be read from {@link interaction}.
   */
  public interactive = false;

  /**
   * Receives an event every time the {@link interaction} of this node changes. Events
   * are propagated through event queues of parent nodes (event bubbling).
   */
  public onInteract = new EventQueue<InteractionEvent>();

  /** Node pivot. This does not affect the pivot of child nodes. */
  public pivot: Pivot = PivotPreset.TOP_LEFT;

  /** @internal */
  public _widget?: W;

  /**
   * @param x Either world or screen position along x-axis, depending on {@link align}.
   * @param y Either world or screen position along y-axis, depending on {@link align}.
   * @param layer Id of the renderer layer on which this root should be rendered. If not
   *  specified, it will be rendered on the first layer that is available. If this root
   *  is the child of another root, this setting will be ignored.
   * @param align Determines if this UI element is aligned to the world or screen.
   */
  constructor(
    public x = 0,
    public y = 0,
    public layer?: LayerId,
    public align = UiAlign.Screen
  ) {}

  public static use<W extends UiWidget>(widget: W, x = 0, y = 0): UiNode<W> {
    const root = new UiNode<W>(x, y);

    root.setWidget(widget);

    return root;
  }

  /** Creates a {@link UiNode} that is aligned to the screen. */
  public static screen(x = 0, y = 0, layer?: LayerId): UiNode {
    return new UiNode(x, y, layer, UiAlign.Screen);
  }

  /** Creates a {@link UiNode} that is aligned to the world. */
  public static world(x = 0, y = 0, layer?: LayerId): UiNode {
    return new UiNode(x, y, layer, UiAlign.World);
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

  /** Attaches a {@link UiWidget} to this node. */
  public setWidget(widget: W): this {
    // Remove previous widget from container.
    if (this._widget) {
      this.container.removeChild(this._widget.view);
    }

    this._widget = widget;

    // Always at the widget as the first child of the container.
    this.container.addChild(widget.view);

    return this;
  }

  /** Returns the {@link UiWidget widget} that is attached to this node, if any. */
  public getWidget(): W | undefined {
    return this._widget;
  }

  /**
   * Makes this root node interactive.
   *
   * @see interactive
   * @see interact
   */
  public toInteractive(): this {
    this.interactive = true;

    return this;
  }

  /** Sets the {@link pivot}. */
  public setPivot(pivot: Pivot): this {
    this.pivot = pivot;

    return this;
  }

}

