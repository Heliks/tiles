import { hasFlag, parseGID, TmxGIDFlag } from "./gid";

describe('parseGID', () => {
  it('should parse a Tiled GID', () => {
    // This GID represents the "real" global ID of "154" with both the horizontal and
    // vertical bit flags enabled.
    expect(parseGID(3221225626)).toBe(154);
  });

  it('should not falsify GIDs', () => {
    // This GID has no bit flags so the result should be the same as the input.
    expect(parseGID(154)).toBe(154);
  });
});

describe('hasFlag', () => {
  it('should check if a GID has a bitflag set', () => {
    // GID of 154 flipped on x axis.
    const gid = 2147483802;

    expect(hasFlag(gid, TmxGIDFlag.FlipX)).toBeTruthy();
    expect(hasFlag(gid, TmxGIDFlag.FlipY)).toBeFalsy();
  });
});
