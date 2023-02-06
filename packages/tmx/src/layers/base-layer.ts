import { HasProperties, TmxProperties } from '../tmx-properties';


/** @internal */
export abstract class BaseLayer<D, T, P extends TmxProperties = TmxProperties> implements HasProperties<P> {

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




