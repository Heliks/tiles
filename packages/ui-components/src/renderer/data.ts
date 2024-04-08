/** A component that carries data of type `T`. */
export class Data<T = unknown> {

  /** The data that is being carried by this component. */
  constructor(public data: T) {}

}
