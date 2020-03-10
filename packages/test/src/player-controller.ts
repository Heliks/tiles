import { ProcessingSystem, Transform, World } from '@tiles/engine';
import { Query, System } from '@tiles/entity-system';

export class Pawn {}

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

  constructor() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  protected onKeyDown(event: KeyboardEvent) {
    this.keysDown.add(event.code);
  }

  protected onKeyUp(event: KeyboardEvent) {
    this.keysDown.delete(event.code);
    this.keysUp.add(event.code);
  }

  public isKeyDown(key: KeyCode) {
    return this.keysDown.has(key);
  }

  public isKeyUp(key: KeyCode) {
    return this.keysUp.has(key);
  }

  public update() {

  }

}

export class PlayerController extends ProcessingSystem {

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        Pawn,
        Transform
      ]
    };
  }

  public update(world: World): void {

  }

}
