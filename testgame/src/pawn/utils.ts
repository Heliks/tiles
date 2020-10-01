import { SpriteAnimation } from '@heliks/tiles-pixi';
import { RigidBody } from '@heliks/tiles-physics';
import { InputHandler } from '../input';
import { Pawn } from './pawn-controller';
import { Entity, State, StateMachine, Ticker, Transform, World } from '@heliks/tiles-engine';
import { Direction } from '../components/direction';

export interface PawnStateData {
  animation: SpriteAnimation;
  body: RigidBody;
  directionIndicator: Entity;
  direction: Direction;
  entity: Entity;
  input: InputHandler;
  pawn: Pawn;
  ticker: Ticker;
  world: World;
  transform: Transform;
}

type PawnState = State<StateMachine<PawnStateData>>;
