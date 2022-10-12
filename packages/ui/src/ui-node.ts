import { UiWidget } from './ui-widget';
import { getPivotPosition, Pivot, PIVOT_TOP_LEFT } from './pivot';


export enum AlignNode {
  /** Position of node is a world position. */
  World,
  /** Position of node is a screen position. */
  Screen
}

export enum Interaction {
  None,
  Clicked
}

/**
 * Renders a UI node on the entity to which this component is attached to.
 *
 * The dimensions of the node is measured in pixels. The position is either measured
 * in in-game units or pixels, depending on where the node is aligned to. By default,
 * nodes are aligned to the screen and have their pivot in their top left corner.
 */
export class UiNode<W extends UiWidget = UiWidget> {

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
   * Determines the pivot of the UI element. Default is its own top left corner.
   *
   * @see Pivot
   */
  public pivot: Pivot = PIVOT_TOP_LEFT;

  /** Width in px. */
  public get width(): number {
    return this.widget.view.width;
  }

  /** Height in px. */
  public get height(): number {
    return this.widget.view.height;
  }

  /** Contains `true` if the node is visible. */
  public get isVisible(): boolean {
    return this.widget.view.visible;
  }

  /**
   * @param widget The widget that should be renderer by this node.
   * @param x Either world or screen x-axis position, depending on {@link align}.
   * @param y Either world or screen y-axis position, depending on {@link align}.
   * @param align Determines if the node is aligned to the world space or screen. If this
   *  node is the child of another node, this position is always relative to the parent.
   *  By default, node are aligned to the screen.
   */
  constructor(public readonly widget: W, public x = 0, public y = 0, public align = AlignNode.Screen) {
    this.interactive = Boolean(widget.interactive);
  }

  /** Creates a {@link UiNode} that is aligned to the screen. */
  public static screen<T extends UiWidget>(widget: T, x = 0, y = 0): UiNode<T> {
    return new UiNode(widget, x, y, AlignNode.Screen);
  }

  /** Creates a {@link UiNode} that is aligned to the world. */
  public static world<T extends UiWidget>(widget: T, x = 0, y = 0): UiNode<T> {
    return new UiNode(widget, x, y, AlignNode.World);
  }

  /** @internal */
  public updateViewPivot(): void {
    getPivotPosition(
      this.pivot,
      this.widget.view.width,
      this.widget.view.height,
      this.widget.view.pivot
    );
  }

  /** Sets the {@link pivot}. */
  public setPivot(pivot: Pivot): this {
    this.pivot = pivot;

    return this;
  }

  /** Shows the node if it was previously hidden. */
  public show(): this {
    this.widget.view.visible = true;

    return this;
  }

  /** Hides the UI node. Hidden nodes will still be updated, but not drawn. */
  public hide(): this {
    this.widget.view.visible = false;

    return this;
  }

}
