/**
 * The document is the entire "page" of {@link UiElements UI elements} and can be used
 * to influence the layout tree.
 */
export class Document {

  /**
   * Indicates if the document is invalidated. If this is `true`, all checks for element
   * insertion and layout calculation are re-triggered on this frame.
   */
  public invalid = false;

  /**
   * Invalidates the current document so that it is re-evaluated on this frame, which re-
   * triggers all checks for element insertion and layout calculation.
   *
   * Note: Use with caution. This can cause an infinite loop when layout never becomes
   * valid during this frame.
   */
  public invalidate(): void {
    this.invalid = true;
  }

}
