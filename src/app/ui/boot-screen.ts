import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { CrtService } from '../services/crt.service';
import { prefersReducedMotion } from './ascii-kit';

const SEEN_KEY = 'jx.booted';
const LINE_MS = 120;

interface BootLine {
  readonly text: string;
  readonly status?: string;
}

/**
 * "Boot" de terminal na primeira visita da sessão: ~1,3 s de linhas de BIOS e
 * o tubo ligando. Qualquer clique ou tecla pula. Não aparece com movimento
 * reduzido, com o CRT desligado nem depois da primeira vez na sessão. O
 * conteúdo real já está no DOM por baixo (esta camada é aria-hidden).
 */
@Component({
  selector: 'app-boot-screen',
  host: { 'aria-hidden': 'true' },
  template: `
    @if (state() !== 'done') {
      <div class="boot" [class.off]="state() === 'leaving'" (click)="finish()">
        <div class="boot-text">
          @for (line of visible(); track $index) {
            <div class="boot-line">
              <span class="txt">{{ line.text }}</span>
              @if (line.status) {
                <span class="ok">{{ line.status }}</span>
              }
            </div>
          }
          <span class="caret"></span>
        </div>
        <p class="boot-skip">clique ou aperte qualquer tecla para pular</p>
      </div>
    }
  `,
  styles: `
    .boot {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: grid;
      align-content: start;
      padding: clamp(1.25rem, 4vw, 3rem);
      background: #050706;
      color: var(--color-phosphor);
      cursor: pointer;
      transform-origin: center;
    }
    .boot-text {
      margin: 0;
      font-size: clamp(0.72rem, 0.65rem + 0.4vw, 0.95rem);
      line-height: 1.7;
      text-shadow: 0 0 8px rgb(92 240 143 / 0.45);
    }
    .boot-line {
      min-height: 1.7em;
    }
    .txt {
      white-space: pre-wrap;
    }
    .ok {
      margin-left: 0.5ch;
      color: var(--color-fg);
    }
    .caret {
      display: inline-block;
      width: 0.6em;
      height: 1.1em;
      vertical-align: -0.2em;
      background: var(--color-phosphor);
    }
    .boot-skip {
      position: absolute;
      right: clamp(1.25rem, 4vw, 3rem);
      bottom: 1.25rem;
      margin: 0;
      font-size: 0.72rem;
      color: var(--color-muted);
    }
    /* O tubo "liga": a tela vira uma linha e some, revelando o site. */
    .off {
      animation: power-on 380ms var(--ease-in-out) forwards;
    }
    @keyframes power-on {
      0% {
        transform: scale(1, 1);
        opacity: 1;
        filter: brightness(1);
      }
      55% {
        transform: scale(1, 0.004);
        opacity: 1;
        filter: brightness(3);
      }
      100% {
        transform: scale(0, 0.004);
        opacity: 0;
      }
    }
  `,
})
export class BootScreen {
  private readonly lines: readonly BootLine[] = [
    { text: 'JX-BIOS v26.11  (c) 2026 joaoxavier.dev' },
    { text: 'CPU: cafe @ 3 xicaras/dia ...............', status: '[ OK ]' },
    { text: 'MEM: 32768K C#  16384K Angular ..........', status: '[ OK ]' },
    { text: 'Montando /dev/curriculo .................', status: '[ OK ]' },
    { text: 'Carregando asciify-engine ...............', status: '[ OK ]' },
    { text: 'Aquecendo o fosforo do monitor ..........', status: '[ OK ]' },
    { text: '' },
    { text: 'joao@xavier:~$ ./start --modo=informal' },
  ];

  protected readonly state = signal<'booting' | 'leaving' | 'done'>('done');
  protected readonly visible = signal<readonly BootLine[]>([]);

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    const crt = inject(CrtService);
    const onKey = () => this.finish();

    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach(clearTimeout);
      removeEventListener('keydown', onKey);
    });

    afterNextRender(() => {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === '1';
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        seen = false;
      }
      if (seen || prefersReducedMotion() || !crt.enabled()) return;

      this.state.set('booting');
      addEventListener('keydown', onKey, { once: true });
      this.lines.forEach((line, index) => {
        this.timers.push(
          setTimeout(() => this.visible.update((shown) => [...shown, line]), index * LINE_MS),
        );
      });
      this.timers.push(setTimeout(() => this.finish(), this.lines.length * LINE_MS + 350));
    });
  }

  protected finish(): void {
    if (this.state() !== 'booting') return;
    this.timers.forEach(clearTimeout);
    this.state.set('leaving');
    this.timers = [setTimeout(() => this.state.set('done'), 400)];
  }
}
