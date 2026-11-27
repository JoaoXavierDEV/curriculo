import { Component, DestroyRef, afterNextRender, inject, output, signal } from '@angular/core';
import { BOOT_LINES, bootDelays } from '../data/boot-lines';

/** Quanto tempo as linhas levam para aparecer e quando a tela some (ms). */
const LINES_MS = 3000;
const OUT_AT_MS = 3500;

/**
 * Tela de "boot Linux" mostrada ao abrir ou atualizar o site.
 * Vai no HTML pré-renderizado e anima só com CSS, então aparece antes da
 * hidratação e some sozinha mesmo sem JavaScript. Toque, clique ou tecla pula.
 */
@Component({
  selector: 'app-boot-screen',
  template: `
    @if (visible()) {
      <div
        class="boot"
        [class.skip]="skipping()"
        [style.--out-at.ms]="outAt"
        (animationend)="onAnimationEnd($event)"
      >
        <p class="sr-only" role="status">Iniciando o sistema…</p>
        <pre class="log" aria-hidden="true">@for (line of lines; track $index) {<span class="line" [class.wide]="line.wide" [style.--d.ms]="delays[$index]">@if (line.status === 'ok') {<span class="st">[  <b>OK</b>  ]</span> } @else if (line.status === 'info') {<span class="st info">[ INFO ]</span> }{{ line.text }}
</span>}<span class="line cursor" [style.--d.ms]="lastDelay"></span></pre>
        <div class="fill"></div>
        <p class="hint" aria-hidden="true">toque ou pressione qualquer tecla para pular</p>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      pointer-events: none;
    }

    .boot {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      /* Começa no topo; ao encher a tela, as linhas novas empurram as antigas para cima. */
      justify-content: flex-end;
      padding: max(1rem, env(safe-area-inset-top)) 1.25rem max(1rem, env(safe-area-inset-bottom));
      background: #050706;
      color: var(--color-fg);
      pointer-events: auto;
      overflow: hidden;
      animation: boot-out 260ms ease-in var(--out-at) forwards;
    }

    .boot::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--crt-lines, none);
      pointer-events: none;
    }

    .boot.skip {
      animation: boot-out 180ms ease-in forwards;
    }

    .log {
      flex: none;
      margin: 0;
      font-family: var(--font-mono, monospace);
      font-size: 0.82rem;
      line-height: 1.45;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .fill {
      flex: 1 0 0;
    }

    .line {
      display: block;
      height: 0;
      overflow: hidden;
      opacity: 0;
      animation: line-in 1ms linear var(--d) forwards;
    }

    .st {
      color: var(--color-fg);
    }

    .st b {
      color: var(--color-phosphor);
      font-weight: 700;
    }

    .st.info {
      color: var(--color-amber);
    }

    .cursor::after {
      content: '';
      display: inline-block;
      width: 0.6em;
      height: 1.1em;
      vertical-align: text-bottom;
      background: var(--color-phosphor);
      animation: blink 1s steps(1) infinite;
    }

    .hint {
      position: absolute;
      right: 1rem;
      bottom: max(0.75rem, env(safe-area-inset-bottom));
      margin: 0;
      padding: 0.2rem 0.5rem;
      background: #050706;
      font-size: 0.7rem;
      color: var(--color-faint);
    }

    @media (max-width: 767px) {
      .boot {
        padding-inline: 0.9rem;
      }

      .log {
        font-size: 0.66rem;
        line-height: 1.5;
      }

      .line.wide {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .line {
        animation: none;
        height: auto;
        opacity: 1;
      }

      .boot {
        animation-delay: 400ms;
      }

      .cursor::after {
        animation: none;
      }
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }

    @keyframes line-in {
      to {
        height: auto;
        opacity: 1;
      }
    }

    @keyframes boot-out {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }
  `,
})
export class BootScreen {
  readonly done = output<void>();

  protected readonly lines = BOOT_LINES;
  protected readonly delays = bootDelays(BOOT_LINES.length, LINES_MS);
  protected readonly lastDelay = LINES_MS + 60;
  protected readonly outAt = OUT_AT_MS;
  protected readonly visible = signal(true);
  protected readonly skipping = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const skip = () => this.skipping.set(true);
      const events = ['keydown', 'pointerdown'] as const;
      events.forEach((name) => addEventListener(name, skip, { once: true, capture: true }));
      // Garantia caso o navegador não dispare animationend (aba em segundo plano).
      const timer = setTimeout(() => this.finish(), OUT_AT_MS + 1500);
      destroyRef.onDestroy(() => {
        clearTimeout(timer);
        events.forEach((name) => removeEventListener(name, skip, { capture: true }));
      });
    });
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.animationName === 'boot-out' || event.animationName.endsWith('boot-out')) {
      if (event.target === event.currentTarget) this.finish();
    }
  }

  private finish(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.done.emit();
  }
}
