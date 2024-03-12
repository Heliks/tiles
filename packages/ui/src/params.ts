import { getType, Type, TypeLike } from '@heliks/tiles-engine';


/** @internal */
const IO_KEY_REGISTRY = {
  /** Contains known input keys for class types. */
  inputs: new Map<Type, string[]>(),
  /** Contains known output keys for class types. */
  outputs: new Map<Type, string[]>()
};


/** Returns all keys of the given `type` that are configured as inputs parameters.  */
export function getInputs<T extends object>(type: TypeLike<T>): string[] {
  return IO_KEY_REGISTRY.inputs.get(getType(type)) ?? [];
}

/** Returns all keys of the given `type` that are configured as output parameters.  */
export function getOutputs<T extends object>(type: TypeLike<T>): string[]{
  return IO_KEY_REGISTRY.outputs.get(getType(type)) ?? [];
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

/** @internal */
function uiComponentOutputDecorator(): Function {
  return function setOutputProperty<T extends Type>(target: Type<T>, key: keyof T) {
    const keys = getOutputs(target.constructor);

    // Safety: This is bs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keys.push(key as any);

    IO_KEY_REGISTRY.outputs.set(target.constructor as Type, keys);
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

/** Allows this property to send its data to its context {@link Host}. */
export const Output = uiComponentOutputDecorator;
