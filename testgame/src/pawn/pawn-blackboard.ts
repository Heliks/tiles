import { SpriteAnimation } from '@heliks/tiles-pixi';
import { RigidBody } from '@heliks/tiles-physics';
import { InputHandler } from '../input';
import { Pawn } from './pawn';
import { Entity, Ticker, Transform, World } from '@heliks/tiles-engine';
import { Direction } from '../components';

/**
 * Blackboard for pawns.
 */
export interface PawnBlackboard {
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
