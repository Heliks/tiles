import { getType, Type, TypeLike } from '@heliks/tiles-engine';


/** @internal */
const IO_KEY_REGISTRY = {
  /** Contains known input keys for class types. */
  inputs: new Map<Type, string[]>()
};


/** Returns all keys of the given `type` that are configured as inputs parameters.  */
export function getInputs<T extends object>(type: TypeLike<T>): string[] {
  return IO_KEY_REGISTRY.inputs.get(getType(type)) ?? [];
}

/** @internal */
function uiComponentInputDecorator(): Function {
  return function setInputProperty<T extends Type>(target: Type<T>, key: keyof T) {
    const keys = getInputs(target.constructor);

    // Safety: This is bs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keys.push(key as any);

    IO_KEY_REGISTRY.inputs.set(target.constructor as Type, keys);
  }
}

/**
 * Allows the context {@link Host} to send data to this property.
 *
 * When the property is a setter, it requires a getter counterpart for proper change
 * detection.
 *
 */
export const Input = uiComponentInputDecorator;
