import { Task } from './task';
import { Game } from '../game';
import { Type } from '../../utils';
import { TypeRegistry, TypeSerializationStrategy, TypeSerializer } from '../../types';


/** Adds a {@link Type} to the {@link TypeRegistry}. */
export class AddType<T> implements Task {

  /**
   * @param type The type that should be registered.
   * @param strategy (optional) Custom serializer.
   */
  constructor(
    private readonly type: Type<T>,
    private readonly strategy?: TypeSerializationStrategy<T>
  ) {}

  /** @internal */
  private getStrategy(): TypeSerializationStrategy<T> {
    return this.strategy ? this.strategy : new TypeSerializer(this.type);
  }

  /** @internal */
  private getTypeName(): string {
    return this.type.name.toLowerCase();
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    game.world.get(TypeRegistry).register(
      this.type,
      this.getStrategy(),
      this.getTypeName()
    );
  }

}
