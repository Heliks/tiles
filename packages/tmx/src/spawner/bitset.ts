/**
 * Custom type that allows the creation of bitsets from tiled objects. The bit is
 * extracted from the object key, and added to the set if its value is `true`.
 */
export type TmxBitSet = {

  /**
   * Defines a bit with the key and determines if it's switched on depending on its
   * value. The key should be formatted like this:
   *
   * ```json
   *  {
   *    "<name> <bit>": true
   *  }
   * ```
   *
   * The name serves no practical purpose and only exits for readability when working
   * in the tiled editor. In the following example, the terrain bit (0) is switched on,
   * and the player bit (1) is switched off:
   *
   * ```json
   *  {
   *    "terrain 0": true,
   *    "player 1": false
   *  }
   * ```
   */
  [key: string]: boolean;

}

export function parseBit(key: string): number {
  const split = key.split(' ');
  const bit = Number(split[1]);

  if (split.length !== 2 || isNaN(bit)) {
    throw new Error('Format must be "(name:string) (bit: number)"');
  }

  return bit;
}

/** Returns a bit mask containing all bits that are toggled on in the given bitset `data`. */
export function parseBitSet(data: TmxBitSet): number {
  let bits = 0;

  for (const key in data) {
    if (data[key]) {
      bits |= parseBit(key);
    }
  }

  return bits;
}
