import { Element } from '@heliks/tiles-ui';


export class NoopElement implements Element {

  /** @inheritDoc */
  public update = jest.fn();

}
