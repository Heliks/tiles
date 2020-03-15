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

  public update() {}

}

export class PlayerController extends ProcessingSystem {

  protected inputHandler = new InputHandler();
  protected speed = 1;

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
    const $trans = world.storage(Transform);

    for (const entity of this.group.entities) {
      const trans = $trans.get(entity);

      // Movement on x axis.
      if (this.inputHandler.isKeyDown(KeyCode.A)) {
        trans.x -= this.speed;
      }
      else if (this.inputHandler.isKeyDown(KeyCode.D)) {
        trans.x += this.speed;
      }

      // Movement on y axis.
      if (this.inputHandler.isKeyDown(KeyCode.W)) {
        trans.y -= this.speed;
      }
      else if (this.inputHandler.isKeyDown(KeyCode.S)) {
        trans.y += this.speed;
      }
    }
  }

}
