class Timer {
  constructor({ onTick, onComplete }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this._durationMs = 30000;
    this._startTime = null;
    this._running = false;
    this._rafId = null;
  }

  get durationSec() {
    return this._durationMs / 1000;
  }

  start() {
    this._startTime = Date.now();
    this._running = true;
    this._tick();
  }

  pause() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  resume() {
    this._startTime = Date.now();
    this._running = true;
    this._tick();
  }

  reset() {
    this.pause();
    this._startTime = null;
    this.onTick(1);
  }

  setDuration(sec) {
    this._durationMs = sec * 1000;
  }

  _tick() {
    if (!this._running) return;
    const elapsed = Date.now() - this._startTime;
    const progress = Math.max(0, 1 - elapsed / this._durationMs);
    this.onTick(progress);
    if (progress <= 0) {
      this._running = false;
      this.onComplete();
      return;
    }
    this._rafId = requestAnimationFrame(() => this._tick());
  }
}
