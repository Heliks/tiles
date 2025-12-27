export interface ParserConfig {
  /**
   * For physics, coordinates and geometric sizes can be converted into world units by
   * defining a unit size (number of pixels per meter). The default is `16`.
   *
   * To disable the unit conversation and use pixel values (not recommended), set the
   * unit size to `1`.
   */
  unitSize: number;
}
