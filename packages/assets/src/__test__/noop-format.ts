import { Format } from '../format';


export class NoopFormat implements Format<unknown, unknown> {

  /** @inheritDoc */
  getAssetType = jest.fn();

  /** @inheritDoc */
  process = jest.fn();

  /**
   * @param extensions {@link Format.extensions}
   */
  constructor(public readonly extensions = ['json']) {}

}
