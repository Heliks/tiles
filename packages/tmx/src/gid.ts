/** Bitflags to extract certain options from a global tile ID. */
export enum TmxGIDFlag {
  FlipX  = 0x80000000,
  FlipY  = 0x40000000,
  FlipXY = 0x20000000
}

/** Bitmask used to extract the "real" global ID. from a tiled global ID. */
const TMX_GID_MASK = TmxGIDFlag.FlipX | TmxGIDFlag.FlipY | TmxGIDFlag.FlipXY;

/** Extracts the global id of a tile from a "GID". */
export function parseGID(gid: number): number {
  return gid & ~TMX_GID_MASK;
}

/** Returns true if the given `gid` contains the given bitflag `flag`. */
export function hasFlag(gid: number, flag: TmxGIDFlag): boolean {
  return Boolean(gid & flag);
}
