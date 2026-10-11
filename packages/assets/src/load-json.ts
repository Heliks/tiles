import { Format } from './fs';


/**
 * Default format to load .json files.
 *
 * This does no additional parsing and will return the loaded JSON as is.
 */
export class LoadJSON implements Format<object, object> {

  /** @inheritDoc */
  public readonly extensions = ['json'];

  constructor(extensions?: string[]) {
    if (extensions) {
      this.extensions.push(...extensions);
    }
  }

  /** @inheritDoc */
  public process(data: object): object {
    return data;
  }

}
