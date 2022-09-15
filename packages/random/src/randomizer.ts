import { getRandomInt } from './utils';


/** @internal */
interface Weighted<T> {
  weight: number;
  value: T;
}

/**
 * Randomizer to select a random item, where each item is weighted with a specified
 * probability of being selected.
 *
 * For example:
 *
 * ```ts
 * class random = new Randomizer<string>();
 *
 * random.add('A', 10);
 * random.add('B', 25);
 * random.add('C', 50);
 *
 * console.log(random.get());
 * ```
 *
 * The randomizer will pick a random item from the items A, B and C, where C is twice
 * as likely to be picked as B, and 5 times as likely as item A.
 *
 * Weights are not percentages, but arbitrary values. The percentage of each item being
 * selected depends on the total sum of all weights combined.
 */
export class Randomizer<T> {

  /** Contains all items from which a random one can be returned. */
  private readonly items: Weighted<T>[] = [];

  /** @internal */
  private _end = new Map<Weighted<T>, number>();

  /** @internal */
  private _start = new Map<Weighted<T>, number>();

  /**
   * Removes all values that were added to the randomizer.
   *
   * @see add()
   */
  public clear(): this {
    this.items.length = 0;

    return this;
  }

  /**
   * Adds a `value`.
   *
   * @param value Value that can be selected by the randomizer.
   * @param weight Arbitrary value that represents the probability of being selected.
   */
  public add(value: T, weight: number): this {
    this.items.push({ weight, value });

    return this;
  }

  /** @internal */
  private updateWeightRanges(): number {
    this._start.clear();
    this._end.clear();

    let sum = 0;

    for (const item of this.items) {
      // Start of the range for this item.
      this._start.set(item, sum);

      sum += item.weight;

      this._end.set(item, sum);
    }

    return sum;
  }

  /**
   * Returns a random value `T` from the values that were previously added to the
   * randomizer. Throws an error if there are no values to select from.
   */
  public get(): T {
    if (this.items.length === 0) {
      throw new Error('Must have at least one item.');
    }

    const sum = this.updateWeightRanges();
    const rnd = getRandomInt(sum, 1);

    const item = this.items.find(
      // safety: id ranges were just updated with the current item set, so every item
      // should have a corresponding start and end weight.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      item => this._start.get(item)! <= rnd && this._end.get(item)! >= rnd
    );

    // safety: we know there is at least one item from which can be picked, so this
    // should always contain something.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return item!.value;
  }

}
