export class BitSet {

  /**
   * The bit-set's internal decimal representation. Modifying this directly is
   * highly discouraged.
   */
  public value = 0;

  /**
   * Adds the given id to the set. Returns true if the id was not
   * contained in the set previously.
   */
  public add(id: number): boolean {
    if (this.value & id) {
      return false;
    }

    this.value |= id;

    return true;
  }

  /** Returns true if the given id is contained in the set. */
  public has(id: number): boolean {
    return (this.value & id) !== 0;
  }

  /**
   * Removes the given id from the set. Returns true if the id was
   * contained in the set previously.
   */
  public remove(id: number): boolean {
    if ((this.value & id) === 0) {
      return false;
    }

    this.value &= ~id;

    return true;
  }

  // noinspection JSUnusedGlobalSymbols
  /** Sets all bits in this set to "0". */
  public clear(): void {
    this.value = 0;
  }

  /** Returns true if the bits of the given mask are equal to this set. */
  public equals(mask: BitSet): boolean {
    return mask.value === this.value;
  }

  /** Returns true if all bits of the given mask are contained in this set. */
  public contains(mask: BitSet): boolean {
    return (mask.value & this.value) === this.value;
  }

  /** Returns true if no bit of the given mask is contained in this set. */
  public excludes(mask: BitSet): boolean {
    return (mask.value & this.value) === 0;
  }

  public maskInt(value: number): number {
    return this.value & value;
  }

}
