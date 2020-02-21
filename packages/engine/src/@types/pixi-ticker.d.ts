declare module '@pixi/ticker' {
  export class Ticker {
    protected _tick(time: number): void;
    protected _requestId: number | null;
    protected _maxElapsedMS: number;

    protected _requestIfNeeded(): void;
    protected _cancelIfNeeded(): void;
    protected _startIfPossible(): void;

    autoStart: boolean;
    deltaTime: number;
    elapsedMS: number;
    lastTime: number;
    speed: number;
    started: boolean;

    FPS: number;
    minFPS: number;

    add(fn: (deltaTime: number) => void, context?: any): Ticker;
    addOnce(fn: (deltaTime: number) => void, context?: any): Ticker;
    remove(fn: (deltaTime: number) => void, context?: any): Ticker;
    start(): void;
    stop(): void;
    update(): void;

  }
}
