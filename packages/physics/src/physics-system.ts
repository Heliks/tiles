import { Injectable, System, Ticker, World } from '@heliks/tiles-engine';
import { Physics } from './physics';

/** Synchronizes `RigidBody` components with their counterpart in the physics world. */
@Injectable()
export class PhysicsSystem implements System {

  /**
   * @param adapter The physics adapter.
   * @param ticker [[Ticker]].
   */
  constructor(
    private readonly adapter: Physics,
    private readonly ticker: Ticker
  ) {}

  /** @inheritDoc */
  public boot(world: World): void {
    this.adapter.setup(world);
  }

  /** @inheritDoc */
  public update(): void {
    this.adapter.update(this.ticker.getDeltaSeconds());
  }

}
