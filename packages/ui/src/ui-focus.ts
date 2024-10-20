export class UiFocus {

  /**
   * Contains `true` if there was a pointer down event on any UI node during this
   * frame. Other systems can use this flag to block inputs from leaking into the
   * game world when the user really wanted to interact with the UI. This is only
   * valid until the end of the frame on which the event happened.
   */
  public captured = false;

}
