import { Vec2Readonly, System, Vec2 } from '@heliks/tiles-engine';

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
}

export class InputHandler implements System {

  protected keysDown = new Set();
  protected keysUp = new Set();

  /** Contains the last known position of the hardware mouse. */
  protected mousePos: Vec2 = [0, 0];

  constructor() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Keyboard events.
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  /** Event listener for when a key was pressed. */
  protected onKeyDown(event: KeyboardEvent): void {
    this.keysDown.add(event.code);
  }

  /** Event listener for when a key was released. */
  protected onKeyUp(event: KeyboardEvent): void {
    this.keysDown.delete(event.code);
    this.keysUp.add(event.code);
  }

  /** Event listener for when the hardware mouse moves. */
  protected onMouseMove(event: MouseEvent): void {
    this.mousePos[0] = event.x;
    this.mousePos[1] = event.y;
  }

  public isKeyDown(key: KeyCode): boolean {
    return this.keysDown.has(key);
  }

  /** Returns the last known position of the mouse. */
  public getMousePos(): Vec2Readonly {
    return this.mousePos;
  }

  public update() {}

}
