import { HasProperties, Properties } from '../properties';


/** @internal */
export abstract class BaseLayer<D, T, P extends Properties = Properties> implements HasProperties<P> {

  /**
   * @param name Custom layer name.
   * @param data Layer data.
   * @param type Layer type
   * @param properties Custom layer properties.
   * @param isVisible Determines if the layer is visible or not.
   */
  constructor(
    public readonly name: string,
    public readonly type: T,
    public readonly data: D,
    public readonly properties: P,
    public readonly isVisible: boolean
  ) {}

}




