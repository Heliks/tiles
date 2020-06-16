import { ProcessingSystem, ReadVec2, StateMachine, Ticker, Transform, World } from '@tiles/engine';
import { Entity, Query } from '@tiles/entity-system';
import { RigidBody } from "@tiles/physics";
import { Injectable } from "@tiles/injector";
import { SpriteAnimation } from "@tiles/pixi";
import { InputHandler } from "./input";
import { IdleState, PawnStateData } from "./pawn-state";
import { Direction } from "./const";
import { Camera } from "@tiles/pixi";

export class Pawn {

  public direction = Direction.Down;
  public cooldown = 0;

  public canCast() {
    return this.cooldown <= 0;
  }

}


/** Returns the Dot product of two 2D vectors `vecA` and `vecB`. */
function vec2dot(vecA: ReadVec2, vecB: ReadVec2): number {
  return (vecA[0] * vecB[0]) + (vecA[1] * vecB[1]);
}

@Injectable()
export class PlayerController extends ProcessingSystem {

  protected inputHandler = new InputHandler();

  constructor(protected readonly ticker: Ticker) {
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

  protected states = new Map<Entity, StateMachine<PawnStateData>>();

  public getPawnState(world: World, entity: Entity): StateMachine<PawnStateData> {
    let state = this.states.get(entity);

    if (state) {
      return state;
    }

    state = new StateMachine<PawnStateData>({
      animation: world.storage(SpriteAnimation).get(entity),
      body: world.storage(RigidBody).get(entity),
      input: this.inputHandler,
      ticker: this.ticker,
      transform: world.storage(Transform).get(entity),
      pawn: world.storage(Pawn).get(entity),
      world
    });

    state.start(new IdleState());

    this.states.set(entity, state);

    return state;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _pawn = world.storage(Pawn);

    for (const entity of this.group.entities) {
      const pawn = _pawn.get(entity);

      // Reduce casting cool-down.
      if (pawn.cooldown > 0) {
        pawn.cooldown -= this.ticker.delta;
      }

      // Update pawn state.
      const state = this.getPawnState(world, entity);

      state.update();

      world.get(Camera).transform(
        -state.data.transform.x,
        -state.data.transform.y
      );
    }
  }

}
