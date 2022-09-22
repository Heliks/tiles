import { Format } from '../formats';


export class NoopFormat implements Format<unknown, unknown> {

  /** @inheritDoc */
  public name = 'noop';

  /** @inheritDoc */
  getAssetType = jest.fn();

  /** @inheritDoc */
  process = jest.fn();

}
