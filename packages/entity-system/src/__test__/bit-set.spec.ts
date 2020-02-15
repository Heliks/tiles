import { BitSet } from '../bit-set';

describe('BitSet', () => {
  let fixture: BitSet;

  beforeEach(() => {
    fixture = new BitSet();
  });

  describe('add()', () => {
    it('should add an id', () => {
      // + 0b0101
      fixture.add(1 << 2);
      // + 0b1000
      fixture.add(1 << 3);

      // = 0b1101
      expect(fixture.value).toBe(12);
    });

    it('should return true if the id was not in the set before', () => {
      // Id "4" is not set.
      expect(fixture.add(1 << 2)).toBeTruthy();

      // Id "4" is already set,
      expect(fixture.add(1 << 2)).toBeFalsy();
    });
  });

  describe('remove()', () => {
    // Add "4" by default.
    beforeEach(() => fixture.add(1 << 2));

    it('should remove an id', () => {
      // - 0b101
      fixture.remove(1 << 2);

      // = 0b000
      expect(fixture.value).toBe(0);
    });

    it('should return true if the id was in the set previously', () => {
      // Id "4" is in the set.
      expect(fixture.remove(1 << 2)).toBeTruthy();

      // Id "8" was not in the set.
      expect(fixture.remove(1 << 3)).toBeFalsy();
    });
  });

  it('should return a mask based on an integer', () => {
    const set1 = new BitSet();
    const set2 = new BitSet();

    // 0b101.
    set1.add(1 << 0);
    set1.add(1 << 2);

    // 0b001.
    set2.add(1 << 2);

    // 0b101 & 0b001 should be 0b001.
    expect(set1.maskInt(set2.value)).toBe(1 << 2);
  });

  it('should test if it fully contains another bit-set', () => {
    // 0b101
    fixture.add(1 << 0);
    fixture.add(1 << 2);

    const b100 = new BitSet();
    const b101 = new BitSet();
    const b111 = new BitSet();

    b100.add(1 << 2);

    b101.add(1 << 0);
    b101.add(1 << 2);

    b111.add(1 << 0);
    b111.add(1 << 1);
    b111.add(1 << 2);

    expect(fixture.contains(b111)).toBeTruthy();
    expect(fixture.contains(b101)).toBeTruthy();
    expect(fixture.contains(b100)).toBeFalsy();
  });

  it('should test if it fully excludes another bit-set', () => {
    // 0b101
    fixture.add(1 << 0);
    fixture.add(1 << 2);

    const b010 = new BitSet();
    const b110 = new BitSet();

    b010.add(1 << 1);

    b110.add(1 << 1);
    b110.add(1 << 2);

    expect(fixture.excludes(b010)).toBeTruthy();
    expect(fixture.excludes(b110)).toBeFalsy();
  });

  it('should test if two bit-sets are equal', () => {
    // 0b101
    fixture.add(1 << 0);
    fixture.add(1 << 2);

    const b101 = new BitSet();
    const b110 = new BitSet();

    b101.add(1 << 0);
    b101.add(1 << 2);

    b110.add(1 << 1);
    b110.add(1 << 2);

    expect(fixture.equals(b101)).toBeTruthy();
    expect(fixture.equals(b110)).toBeFalsy();
  });
});
