export class Input {
  readonly keys = new Set<string>();
  readonly mouseDown = new Set<number>();
  mouseDX = 0;
  mouseDY = 0;
  locked = false;
  started = false;

  onEscape: (() => void) | null = null;
  onTabDown: (() => void) | null = null;
  onTabUp: (() => void) | null = null;
  onStart: (() => void) | null = null;

  requestLock: () => void = () => {};

  constructor(canvas: HTMLElement, hint: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
      if (e.code === 'Tab') {
        e.preventDefault();
        if (this.started && !e.repeat) this.onTabDown?.();
      }
      if (e.code === 'Escape' && this.started) {
        this.onEscape?.();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'Tab') {
        e.preventDefault();
        if (this.started) this.onTabUp?.();
      }
    });
    window.addEventListener('blur', () => { this.keys.clear(); this.mouseDown.clear(); });

    const tryLock = () => {
      const req = canvas.requestPointerLock?.();
      if (req && typeof (req as Promise<void>).then === 'function') {
        (req as Promise<void>).catch(() => { /* iframe may block pointer lock */ });
      }
    };
    this.requestLock = tryLock;

    hint.addEventListener('click', () => {
      const first = !this.started;
      this.started = true;
      hint.classList.add('hidden');
      document.body.classList.add('playing');
      tryLock();
      if (first) this.onStart?.();
    });
    canvas.addEventListener('click', () => { if (this.started && !this.locked) tryLock(); });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
    });
    document.addEventListener('pointerlockerror', () => {
      this.locked = false;
      console.warn('[input] pointer lock blocked — use right-click drag to look');
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.started) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (!this.started) return;
      this.mouseDown.add(e.button);
      if (e.button === 2) e.preventDefault();
    });
    window.addEventListener('mouseup', (e) => this.mouseDown.delete(e.button));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  consumeMouse(): { dx: number; dy: number } {
    const dx = this.mouseDX;
    const dy = this.mouseDY;
    this.mouseDX = 0;
    this.mouseDY = 0;
    return { dx, dy };
  }
}
