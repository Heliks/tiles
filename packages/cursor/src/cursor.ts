import { Vec2 } from '@heliks/tiles-engine';


export enum CursorButton {
  /** The main button, usually the left button or the un-initialized state */
  Primary = 'cursor_primary',
  /** The Secondary button, usually the right button */
  Secondary = 'cursor_secondary',
  /** Auxiliary button, usually the wheel button or the middle button */
  Auxiliary = 'cursor_auxiliary'
}

/** Resource that tracks the mouse cursor. */
export class Cursor {

  /** Contains all buttons that are currently pressed down. */
  public readonly down = new Set<CursorButton>();

  /** Contains all buttons just pressed on the last frame.*/
  public readonly downNow = new Set<CursorButton>();

  /** Contains all buttons released on the last frame. */
  public readonly up = new Set<CursorButton>();

  /** Contains the cursors' last known screen position.*/
  public readonly screen = new Vec2();

  /** Contains the cursors' last known world position. */
  public readonly world = new Vec2();

  /** Returns `true` when the given `button` is pressed down. */
  public isDown(button = CursorButton.Primary): boolean {
    return this.down.has(button);
  }

  /** Returns `true` when the given `button` was just pressed on the last frame. */
  public isDownNow(button = CursorButton.Primary): boolean {
    return this.downNow.has(button);
  }

  /** Returns `true` if the given `button` was just released on the last frame. */
  public isUp(button = CursorButton.Primary): boolean {
    return this.up.has(button);
  }

}

