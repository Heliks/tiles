import { Align } from '@heliks/tiles-pixi';
import { UiWidget } from './ui-widget';
import { getPivotPosition, Pivot, PIVOT_TOP_LEFT } from './pivot';


export enum AlignWidget {
  /** Position of widget is a world position. */
  World,
  /** Position of widget is a screen position. */
  Screen
}

/**
 * Renders a UI widget on the entity to which this component is attached to.
 *
 * The dimensions of the widget is measured in pixels. The position is either measured
 * in in-game units or pixels, depending on where the widget is aligned to. By default,
 * widgets are aligned to the screen and have their pivot in their top left corner.
 */
export class Widget<W extends UiWidget = UiWidget> {

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

  /**
   * @param widget The widget that should be renderer by this component.
   * @param x Either world or screen x-axis position, depending on {@link align}.
   * @param y Either world or screen y-axis position, depending on {@link align}.
   * @param align Determines if the widget is aligned to the world space or to the
   *  screen. If this widget is the child of another widget, this position is always
   *  relative to the parent. By default, widgets are aligned to the screen.
   */
  constructor(public readonly widget: W, public x = 0, public y = 0, public align = AlignWidget.Screen) {}

  /** Creates a {@link Widget} that is aligned to the screen. */
  public static screen<T extends UiWidget>(widget: T, x = 0, y = 0): Widget<T> {
    return new Widget(widget, x, y, AlignWidget.Screen);
  }

  /** Creates a {@link Widget} that is aligned to the world. */
  public static world<T extends UiWidget>(widget: T, x = 0, y = 0): Widget<T> {
    return new Widget(widget, x, y, AlignWidget.World);
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

}
