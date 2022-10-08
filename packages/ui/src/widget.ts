import { Align } from '@heliks/tiles-pixi';
import { UiWidget } from './ui-widget';


export enum AlignWidget {
  /** Position of widget is a world position. */
  World,
  /** Position of widget is a screen position. */
  Screen
}


/**
 * Renders a UI widget on the entity to which this component is attached to.
 *
 * The dimension of a widget is measured in pixels. The position is measured in in-game
 * units because widgets exist directly in the world space.
 */
export class Widget<W extends UiWidget = UiWidget> {

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
   * @param pivot Determines the widget pivot. Default is center.
   */
  constructor(
    public readonly widget: W,
    public x = 0,
    public y = 0,
    public align = AlignWidget.Screen,
    public pivot = Align.Center
  ) {}

  /** Creates a {@link Widget} that is aligned to the screen. */
  public static screen<T extends UiWidget>(widget: T, x = 0, y = 0): Widget<T> {
    return new Widget(widget, x, y, AlignWidget.Screen);
  }

  /** Creates a {@link Widget} that is aligned to the world. */
  public static world<T extends UiWidget>(widget: T, x = 0, y = 0): Widget<T> {
    return new Widget(widget, x, y, AlignWidget.World);
  }

  /** @inheritDoc */
  public update(x: number, y: number): void {
    this.widget.update();
  }

}
