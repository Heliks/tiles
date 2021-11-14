import { Container } from '../drawable';

/** @internal */
export class Layer extends Container {

  /**
   * @param sortable (optional) If set to true children of this layer will automatically
   *  be depth-sorted on the CPU before they are rendered.
   */
  constructor(public sortable = false) {
    super();
  }

}
