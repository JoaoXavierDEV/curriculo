import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { CrtService } from '../services/crt.service';

const SECTION_LABELS: Record<string, string> = {
  topo: '~',
  links: '~/links',
  projetos: '~/projetos',
  experiencia: '~/carreira',
  formacao: '~/formacao',
  outros: '~/outros',
  contato: '~/contato',
};

/**
 * Barra de status no estilo vim/tmux, fixa no rodapé da tela: modo, seção
 * atual, posição na página, relógio e o botão que liga/desliga o CRT. Só o
 * botão é interativo; o resto é decoração e fica escondido de leitores de tela.
 */
@Component({
  selector: 'app-status-bar',
  template: `
    <div class="bar">
      <span class="mode" aria-hidden="true">NORMAL</span>
      <span class="path" aria-hidden="true">{{ path() }}</span>
      <span class="spacer"></span>
      <button
        type="button"
        class="crt-toggle"
        [attr.aria-pressed]="crt.enabled()"
        (click)="crt.toggle()"
      >
        <span aria-hidden="true">[</span>efeito CRT: {{ crt.enabled() ? 'on' : 'off'
        }}<span aria-hidden="true">]</span>
      </button>
      <span class="meta" aria-hidden="true">utf-8</span>
      <span class="meta" aria-hidden="true">{{ progress() }}</span>
      <span class="clock" aria-hidden="true">{{ clock() }}</span>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: auto 0 0 0;
      z-index: 58;
      display: block;
      height: var(--statusbar-h);
      padding-bottom: env(safe-area-inset-bottom);
      background: #060807;
      border-top: 1px solid var(--color-line);
      font-size: 0.72rem;
    }
    .bar {
      display: flex;
      align-items: stretch;
      height: var(--statusbar-h);
      max-width: 100%;
    }
    .bar > * {
      display: flex;
      align-items: center;
      padding: 0 0.7rem;
      white-space: nowrap;
    }
    .mode {
      background: var(--color-phosphor);
      color: var(--color-ground);
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .path {
      background: var(--color-surface-2);
      color: var(--color-fg);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .spacer {
      flex: 1;
      padding: 0;
    }
    .crt-toggle {
      border: 0;
      border-left: 1px solid var(--color-line);
      background: transparent;
      color: var(--color-phosphor);
      font: inherit;
      cursor: pointer;
      transition:
        background-color 140ms ease,
        transform 160ms var(--ease-out);
    }
    .crt-toggle:active {
      transform: scale(0.97);
    }
    .crt-toggle:focus-visible {
      outline-offset: -3px;
    }
    @media (hover: hover) and (pointer: fine) {
      .crt-toggle:hover {
        background: var(--color-surface-2);
      }
    }
    .meta,
    .clock {
      border-left: 1px solid var(--color-line);
      color: var(--color-muted);
    }
    .clock {
      background: var(--color-surface-2);
      color: var(--color-fg);
    }
    @media (max-width: 639px) {
      .bar > .meta,
      .bar > .clock {
        display: none;
      }
    }
  `,
})
export class StatusBar {
  protected readonly crt = inject(CrtService);
  protected readonly path = signal('~');
  protected readonly progress = signal('Top');
  protected readonly clock = signal('--:--');

  constructor() {
    let observer: IntersectionObserver | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const ratio = max > 0 ? scrollY / max : 0;
      this.progress.set(
        ratio < 0.02 ? 'Top' : ratio > 0.98 ? 'Bot' : `${Math.round(ratio * 100)}%`,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    const tick = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      this.clock.set(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    };

    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      if (timer) clearInterval(timer);
      if (frame) cancelAnimationFrame(frame);
      removeEventListener('scroll', onScroll);
    });

    afterNextRender(() => {
      tick();
      timer = setInterval(tick, 15_000);
      updateProgress();
      addEventListener('scroll', onScroll, { passive: true });

      if (typeof IntersectionObserver === 'undefined') return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.path.set(SECTION_LABELS[entry.target.id] ?? '~');
            }
          }
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      for (const id of Object.keys(SECTION_LABELS)) {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      }
    });
  }
}
