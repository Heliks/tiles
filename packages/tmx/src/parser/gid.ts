/** Bitflags to extract certain options from a global tile ID. */
export enum TmxGIDFlag {
  /** Horizontal flip option. */
  FlipX = 0x80000000,
  /** Vertical flip option. */
  FlipY = 0x40000000,
  /** Vertical flip option. Will be set on tiles that are rotated. */
  FlipXY = 0x20000000
}

/** Bitmask used to extract the "real" global ID. from a tiled global ID. */
const TMX_GID_MASK =
  TmxGIDFlag.FlipX |
  TmxGIDFlag.FlipY |
  TmxGIDFlag.FlipXY;

/**
 * Extracts a global ID from a Tiled "gid". This is required because in Tiled a GID can
 * have Bitflags for transformations attached which would result in an invalid global
 * ID if used directly.
 */
export function parseGID(gid: number): number {
  return gid & ~TMX_GID_MASK;
}

/** Returns `true` if a Tiled global ID `gid` has set the bitflag `flag`. */
export function hasFlag(gid: number, flag: TmxGIDFlag): boolean {
  return Boolean(gid & flag);
}
