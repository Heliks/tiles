import { Inject, Injectable, System, Ticker, World } from '@heliks/tiles-engine';
import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';

/** Synchronizes `RigidBody` components with their counterpart in the physics world. */
@Injectable()
export class PhysicsSystem implements System {

  /**
   * @param adapter The physics adapter.
   * @param ticker [[Ticker]].
   */
  constructor(
    @Inject(ADAPTER_TK)
    private readonly adapter: PhysicsAdapter,
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
