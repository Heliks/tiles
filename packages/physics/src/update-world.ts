import { Injectable, System, Ticker, World } from '@heliks/tiles-engine';
import { Physics } from './physics';

/** Moves the physics world forwards in time based on the tickers delta time. */
@Injectable()
export class UpdateWorld implements System {

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
