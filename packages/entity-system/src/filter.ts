import { BitSet } from './bit-set';

export class Filter {

  /**
   * @param inclusions Mask with bits that must be present to satisfy this filter.
   * @param exclusions mask with bits that are not allowed to be present to satisfy this filter.
   */
  constructor(
    public readonly inclusions = new BitSet(),
    public readonly exclusions = new BitSet()
  ) {
  }

  /** Returns true if the given composition satisfies this filter. */
  public test(composition: BitSet): boolean {
    return this.inclusions.contains(composition)
      && this.exclusions.excludes(composition);
  }

  /** Returns true if the given filter is equal to this one. */
  public equals(filter: Filter): boolean {
    return this.inclusions.equals(filter.inclusions)
      && this.exclusions.equals(filter.exclusions);
  }

}
