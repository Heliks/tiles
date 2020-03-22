import { ProcessingSystem, Ticker, Transform, World } from '@tiles/engine';
import { Query, System } from '@tiles/entity-system';
import { RigidBody } from "@tiles/physics";
import { Injectable } from "@tiles/injector";
import { SpriteAnimation, SpriteDisplay } from "@tiles/pixi";

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

@Injectable()
export class PlayerController extends ProcessingSystem {

  protected inputHandler = new InputHandler();
  protected speed = 16;

  constructor(
    protected readonly ticker: Ticker
  ) {
    super();
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        Pawn,
        RigidBody,
        SpriteAnimation,
        Transform
      ]
    };
  }

  public update(world: World): void {
    const $body = world.storage(RigidBody);
    const $animation = world.storage(SpriteAnimation);

    for (const entity of this.group.entities) {
      const animation = $animation.get(entity);

      // Characters movement velocity adjusted to frame rate.
      const velocity = this.speed / this.ticker.delta;

      // New velocity on x and y axis respectively.
      let vx = 0;
      let vy = 0;

      // Movement on x axis.
      if (this.inputHandler.isKeyDown(KeyCode.A)) {
        animation.play('walk-left');
        vx -= velocity;
      }
      else if (this.inputHandler.isKeyDown(KeyCode.D)) {
        animation.play('walk-left');
        vx += velocity;
      }

      // Movement on y axis.
      if (this.inputHandler.isKeyDown(KeyCode.W)) {
        animation.play('walk-up');
        vy -= velocity;

      }
      else if (this.inputHandler.isKeyDown(KeyCode.S)) {
        animation.play('walk-down');
        vy += velocity;
      }

      $body.get(entity).transformVelocity(vx, vy);
    }
  }

}
