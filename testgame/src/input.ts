import { System, Vec2, vec2 } from '@heliks/tiles-engine';

export enum KeyCode {
  A = 'KeyA',
  B = 'KeyB',
  C = 'KeyC',
  D = 'KeyD',
  E = 'KeyE',
  F = 'KeyF',
  G = 'KeyG',
  H = 'KeyH',
  I = 'KeyI',
  J = 'KeyJ',
  K = 'KeyK',
  L = 'KeyL',
  M = 'KeyM',
  N = 'KeyN',
  O = 'KeyO',
  P = 'KeyP',
  Q = 'KeyQ',
  R = 'KeyR',
  S = 'KeyS',
  T = 'KeyT',
  U = 'KeyU',
  V = 'KeyV',
  W = 'KeyW',
  X = 'KeyX',
  Y = 'KeyY',
  Z = 'KeyZ',
  Space = 'Space',
  MouseLeft = 'MouseLeft',
  MouseRight = 'MouseRight'
}

export class InputHandler implements System {

  /** Keys that are currently being pressed down. */
  private readonly keysDown = new Set<KeyCode>();

  /** @internal */
  private readonly keysDownThisFrameQueue = new Set<KeyCode>();

  /** @internal */
  private readonly keysDownThisFrame = new Set<KeyCode>();

  /** Keys that were recently released. */
  private keysUp = new Set<KeyCode>();

  /** Contains the last known position of the hardware mouse. */
  private mousePos = vec2(0, 0);

  constructor() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  /** Simulates a key press event using `key`. */
  public press(key: KeyCode): this {
    this.keysDown.add(key);
    this.keysDownThisFrameQueue.add(key);

    return this;
  }

  /** Event listener for when the hardware mouse moves. */
  private onMouseMove(event: MouseEvent): void {
    this.mousePos.x = event.x;
    this.mousePos.y = event.y;
  }

  /** Handler for `mousedown` events. */
  private onMouseDown(event: MouseEvent): void {
    switch (event.button) {
      case 0:
        this.press(KeyCode.MouseLeft);
        break;
      case 2:
        this.press(KeyCode.MouseRight);
        break;
    }
  }

  /** Handler for `mouseup` events. */
  private onMouseUp(event: MouseEvent): void {
    switch (event.button) {
      case 0:
        this.keysDown.delete(KeyCode.MouseLeft);
        break;
      case 2:
        this.keysDown.delete(KeyCode.MouseRight);
        break;
    }
  }

  /** Event listener for when a key was released. */
  private onKeyUp(event: KeyboardEvent): void {
    // Todo: Cast
    const code = event.code as KeyCode;

    // Delete from down keys as key can no longer present if we received this event.
    this.keysDown.delete(code);
    this.keysUp.add(code);
  }

  /** Event listener for when a key was pressed. */
  private onKeyDown(event: KeyboardEvent): void {
    // Todo: Cast
    const code = event.code as KeyCode;

    // Ignore events that are continuously fired by holding the key down.
    if (this.keysDownThisFrameQueue.has(code)) {
      return;
    }

    this.press(code);

    this.keysDownThisFrameQueue.add(code);
    this.keysDown.add(code);
  }

  /** Returns `true` if `key` is currently pressed. */
  public isKeyDown(key: KeyCode): boolean {
    return this.keysDown.has(key);
  }

  /**
   * Returns `true` if `key` was pressed down in the current frame.
   *
   * Note: Because of limitations some key-presses from the last frame are counted for
   *  this one as well.
   */
  public isKeyDownThisFrame(key: KeyCode): boolean {
    return this.keysDownThisFrame.has(key) || this.keysDownThisFrameQueue.has(key);
  }

  /** Returns the last known position of the mouse. */
  public getMousePos(): Vec2 {
    return this.mousePos;
  }

  /** @inheritDoc */
  public update(): void {
    // Copy all keys that were pressed halfway through the last frame and copy them to
    // the current one. This is needed to circumvent the fact that the input handler
    // usually runs very early in the update loop and would therefore clear that info
    // before any other system had time to access it. This introduces a small side effect
    // were some key-presses from the last frame are counted for this frame as well.
    this.keysDownThisFrame.clear();

    for (const value of this.keysDownThisFrameQueue.values()) {
      this.keysDownThisFrame.add(value);
    }

    this.keysDownThisFrameQueue.clear();
  }

}
