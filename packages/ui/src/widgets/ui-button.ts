import { EventQueue } from '@heliks/tiles-engine';
import { BoxBackground, UiBox } from './ui-box';

export enum ButtonEvent {
  Down,
  Up
}


export class UiButton extends UiBox {

  /** Indicates if the buttons is currently being clicked. */
  public down = false;

  /** Emits events on certain interactions with the button. */
  public readonly events = new EventQueue<ButtonEvent>();

  /**
   * @param width Width of the box in px.
   * @param height Height of the box in px.
   * @param background {@link BoxBackground}
   */
  constructor(public width: number, public height: number, public background: BoxBackground) {
    super(width, height, background);

    this.view.interactive = true;

    this.view.on('pointerdown', () => this.onPointerDown.bind(this));
    this.view.on('pointerup', () => this.onPointerUp.bind(this));
  }

  /** @internal */
  private onPointerDown(): void {
    this.down = true;
    this.events.push(ButtonEvent.Down);
  }

  /** @internal */
  private onPointerUp(): void {
    this.down = false;
    this.events.push(ButtonEvent.Up);
  }

}
