import { getType, Type, TypeLike } from '@heliks/tiles-engine';


/** @internal */
export const INPUT_MAP = new Map<Type, unknown[]>();

/** @internal */
const OUTPUT_MAP = new Map<Type, unknown[]>();


/** @internal */
type KnownParams<T> = (keyof T)[];

/** Returns all keys of the given `type` that are configured as inputs parameters.  */
export function getInputs<T extends object>(type: TypeLike<T>): (keyof T)[] {
  return INPUT_MAP.get(getType(type)) as KnownParams<T> ?? [];
}

/** Returns all keys of the given `type` that are configured as output parameters.  */
export function getOutputs<T extends object>(type: TypeLike<T>): (keyof T)[]{
  return OUTPUT_MAP.get(getType(type)) as KnownParams<T> ?? [];
}

/** @internal */
function uiComponentInputDecorator(): Function {
  return function setInputProperty<T extends Type>(target: Type<T>, key: keyof T) {
    const keys = getInputs(target.constructor);

    // Safety: This is bs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keys.push(key as any);

    INPUT_MAP.set(target.constructor as Type, keys);
  }
}


/** @internal */
function uiComponentOutputDecorator(): Function {
  return function setOutputProperty<T extends Type>(target: Type<T>, key: keyof T) {
    const keys = getOutputs(target.constructor);

    // Safety: This is bs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keys.push(key as any);

    OUTPUT_MAP.set(target.constructor as Type, keys);
  }
}

/** Allows a parent {@link Context} to send data to this property. */
export const Input = uiComponentInputDecorator;

/** Allows a {@link Context} to send this property to its parent. */
export const Output = uiComponentOutputDecorator;
