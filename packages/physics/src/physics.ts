import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';
import { Entity, Inject, Vec2 } from '@heliks/tiles-engine';
import { Injectable } from '@heliks/tiles-injector';

@Injectable()
export class Physics {

  constructor(
    @Inject(ADAPTER_TK)
    private readonly adapter: PhysicsAdapter,
  ) {}

  /** Applies a linear impulse at the center of an `entity` using `force`. */
  public impulse(entity: Entity, force: Vec2): void {
    this.adapter.impulse(entity, force);
  }

}
