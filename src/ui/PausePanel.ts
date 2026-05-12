export class PausePanel {
  private root: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'pause-panel';
    this.root.classList.add('hidden');
    this.root.innerHTML = `
      <div class="panel">
        <div class="title">PAUSED</div>
        <div class="hint">按 ESC 或點 Resume 繼續</div>
        <button class="resume">Resume</button>
      </div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      #pause-panel { position: fixed; inset: 0; z-index: 18; background: rgba(6,8,14,0.75);
        display: flex; align-items: center; justify-content: center;
        color: #f4f4f8; font-family: system-ui, sans-serif; }
      #pause-panel.hidden { display: none; }
      #pause-panel .panel { background: #1a1d28; padding: 28px 44px; border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column;
        align-items: center; gap: 14px; min-width: 280px; }
      #pause-panel .title { font-size: 34px; font-weight: 700; letter-spacing: 6px; color: #ffd14a;
        text-shadow: 0 0 14px rgba(255,210,80,0.4); }
      #pause-panel .hint { font-size: 13px; opacity: 0.75; }
      #pause-panel .resume { background: #2bb158; color: #fff; border: 0;
        padding: 10px 28px; border-radius: 4px; font-size: 15px; cursor: pointer; letter-spacing: 2px; }
      #pause-panel .resume:hover { background: #3ce06a; }
    `;
    document.head.appendChild(style);
    parent.appendChild(this.root);
  }

  show(onResume: () => void): void {
    this.root.classList.remove('hidden');
    const btn = this.root.querySelector('.resume') as HTMLButtonElement;
    const clone = btn.cloneNode(true) as HTMLButtonElement;
    btn.replaceWith(clone);
    clone.addEventListener('click', () => onResume());
  }

  hide(): void { this.root.classList.add('hidden'); }
}
