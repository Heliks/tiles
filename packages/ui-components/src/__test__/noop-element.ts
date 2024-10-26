import { Element } from '@heliks/tiles-ui';


export class NoopElement implements Element {

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  /** @inheritDoc */
  public update = jest.fn();

}
