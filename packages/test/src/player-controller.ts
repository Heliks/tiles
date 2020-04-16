import { ProcessingSystem, StateMachine, Subscriber, Ticker, Transform, World } from '@tiles/engine';
import { Entity, Query } from '@tiles/entity-system';
import { PhysicsWorld, RigidBody } from "@tiles/physics";
import { Injectable } from "@tiles/injector";
import { SpriteAnimation } from "@tiles/pixi";
import { InputHandler } from "./input";
import { IdleState, PawnStateData } from "./pawn-state";

export class Pawn {}

@Injectable()
export class PlayerController extends ProcessingSystem {

  protected inputHandler = new InputHandler();

  constructor(
    protected readonly ticker: Ticker,
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
      world
    });

    state.start(new IdleState());

    this.states.set(entity, state);

    return state;
  }

  public update(world: World): void {
    for (const entity of this.group.entities) {
      this.getPawnState(world, entity).update();
    }
  }

}
