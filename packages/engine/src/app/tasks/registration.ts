/** Position at which items can be registered. */
export enum RegistrationPosition {
  Default,
  After,
  Before
}

/** @internal */
interface BaseRegistrationInstruction<T> {
  item: T;
  position: RegistrationPosition;
}

/** Instruction to register an item of type `T` after another. */
export interface RegisterAfterInstruction<T> extends BaseRegistrationInstruction<T> {
  after: T;
  position: RegistrationPosition.After;
}

/** Instruction to register an item of type `T` before another. */
export interface RegisterBeforeInstruction<T> extends BaseRegistrationInstruction<T> {
  before: T;
  position: RegistrationPosition.Before;
}

/** Possible registration instructions. */
export type RegistrationInstruction<T> = T | RegisterBeforeInstruction<T> | RegisterAfterInstruction<T>;

/** Creates a {@link RegisterAfterInstruction} for `item` and `after´. */
export function after<T>(item: T, after: T): RegisterAfterInstruction<T> {
  return { after, item, position: RegistrationPosition.After }
}

/** Creates a {@link RegisterBeforeInstruction} for `item` and `before´. */
export function before<T>(item: T, before: T): RegisterBeforeInstruction<T> {
  return { before, item, position: RegistrationPosition.Before };
}

/** Returns `true` if `instruction` is a {@link RegisterAfterInstruction}. */
export function isAfterInstruction<T>(instruction: RegistrationInstruction<T>): instruction is RegisterAfterInstruction<T> {
  return (instruction as BaseRegistrationInstruction<T>).position === RegistrationPosition.After;
}

/** Returns `true` if `instruction` is a {@link RegisterBeforeInstruction}. */
export function isBeforeInstruction<T>(instruction: RegistrationInstruction<T>): instruction is RegisterBeforeInstruction<T> {
  return (instruction as BaseRegistrationInstruction<T>).position === RegistrationPosition.Before;
}


