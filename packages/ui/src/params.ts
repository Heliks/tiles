import { getType, Type, TypeLike } from '@heliks/tiles-engine';


/** @internal */
const INPUT_MAP = new Map<Type, unknown[]>();

/** @internal */
type KnownParams<T> = (keyof T)[];

/** Returns all keys of the given `type` that are configured as inputs parameters.  */
export function getInputParams<T extends object>(type: TypeLike<T>): KnownParams<T> {
  return INPUT_MAP.get(getType(type)) as KnownParams<T> ?? [];
}

/** @internal */
function uiComponentInputDecorator(): Function {
  return function setInputProperty<T extends Type>(target: Type<T>, key: keyof T) {
    const inputs = getInputParams(target.constructor);

    // Safety: This is bs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs.push(key as any);

    INPUT_MAP.set(target.constructor as Type, inputs);
  }
}

/**
 * Allows a parent {@link Context} to send data to this property.
 *
 * Top-level contexts can't automatically receive inputs as they don't have a source to
 * receive data from.
 */
export const Input = uiComponentInputDecorator;
