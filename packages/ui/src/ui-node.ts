import { UiWidget } from './ui-widget';
import { getPivotPosition, Pivot, PIVOT_TOP_LEFT } from './pivot';


/**
 * Component that renders a UI node on the entity to which it is attached to. The entity
 * must be a child of an entity with a {@link UiRoot} component or another node.
 *
 * The alignment of UI nodes depend on the alignment of the ui root of which they are
 * a child of. So are the units in which positions are measured. If the root is aligned
 * to the screen, they are measured in pixels. If aligned to the world, they are measured
 * in in-game units instead.
 */
export class UiNode<W extends UiWidget = UiWidget> {

  /** Determines the pivot of the UI element. Default is top-left corner. */
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
   */
  constructor(public readonly widget: W, public x = 0, public y = 0) {}

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
