import { Attribute } from '../../attribute';
import { Element } from '../../element';


export class NoopAttribute implements Attribute {
  update = jest.fn();
}

export class NoopElement implements Element {

  /** @inheritDoc */
  update = jest.fn();

  /** @inheritDoc */
  public getContext(): this {
    return this;
  }

}