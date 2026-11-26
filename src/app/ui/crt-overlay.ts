import { Component, DestroyRef, afterNextRender, effect, inject, signal } from '@angular/core';
import { CrtService } from '../services/crt.service';
import { loadAsciiKit } from './ascii-kit';

/**
 * Camada fixa por cima da página inteira: scanlines, faixa de refresh, ruído,
 * cintilação e vinheta de tubo. Não recebe clique nem foco. Também liga o
 * rastro de caracteres do cursor (o kit já o desliga em toque e com movimento
 * reduzido).
 */
@Component({
  selector: 'app-crt-overlay',
  host: { 'aria-hidden': 'true', '[class.on]': 'crt.enabled()' },
  template: `
    <div class="crt-scanlines"></div>
    <div class="crt-band"></div>
    <div class="crt-grain"></div>
    <div class="crt-flicker"></div>
    <div class="crt-vignette"></div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 60;
      pointer-events: none;
      display: none;
    }
    :host(.on) {
      display: block;
    }
    :host > div {
      position: absolute;
      inset: 0;
    }
    .crt-scanlines {
      background: repeating-linear-gradient(
        to bottom,
        rgb(0 0 0 / 0) 0,
        rgb(0 0 0 / 0) 2px,
        rgb(0 0 0 / 0.22) 3px,
        rgb(0 0 0 / 0) 4px
      );
    }
    .crt-band {
      height: 22vh;
      inset: 0 0 auto 0;
      background: linear-gradient(
        to bottom,
        transparent,
        rgb(92 240 143 / 0.035) 45%,
        rgb(200 255 217 / 0.05) 50%,
        transparent
      );
      animation: band 9s linear infinite;
    }
    .crt-grain {
      inset: -50%;
      opacity: 0.07;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      animation: grain 0.9s steps(5) infinite;
    }
    .crt-flicker {
      background: rgb(92 240 143 / 0.02);
      animation: flicker 7s steps(1) infinite;
    }
    .crt-vignette {
      background: radial-gradient(
        ellipse 120% 100% at 50% 50%,
        transparent 62%,
        rgb(0 0 0 / 0.5) 100%
      );
    }
    @keyframes band {
      from {
        transform: translateY(-25vh);
      }
      to {
        transform: translateY(105vh);
      }
    }
    @keyframes grain {
      0% {
        transform: translate(0, 0);
      }
      20% {
        transform: translate(-6%, 4%);
      }
      40% {
        transform: translate(5%, -7%);
      }
      60% {
        transform: translate(-3%, 8%);
      }
      80% {
        transform: translate(7%, 2%);
      }
    }
    /* Variação de brilho de ~2%: perceptível como "tubo", longe de ser um flash. */
    @keyframes flicker {
      0%,
      100% {
        opacity: 1;
      }
      31% {
        opacity: 0.3;
      }
      32% {
        opacity: 1;
      }
      67% {
        opacity: 0.5;
      }
      68% {
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .crt-band,
      .crt-grain,
      .crt-flicker {
        animation: none;
      }
      .crt-band {
        display: none;
      }
    }
  `,
})
export class CrtOverlay {
  protected readonly crt = inject(CrtService);

  constructor() {
    const kitReady = signal(false);
    let trail: { destroy(): void } | null = null;
    let cursorTrailFn: (typeof import('asciify-engine/kit'))['cursorTrail'] | null = null;

    inject(DestroyRef).onDestroy(() => trail?.destroy());

    afterNextRender(() => {
      loadAsciiKit()
        .then(({ cursorTrail }) => {
          cursorTrailFn = cursorTrail;
          kitReady.set(true);
        })
        .catch(() => {
          // Sem rastro de cursor.
        });
    });

    effect(() => {
      const on = this.crt.enabled() && kitReady();
      if (on && !trail && cursorTrailFn) {
        trail = cursorTrailFn({
          charset: ' .:-=+*#%@',
          cellSize: 10,
          ink: '--color-phosphor',
          zIndex: 55,
          trail: { strength: 0.42, radius: 0.18 },
          skip: 'app-status-bar, input, textarea',
        });
      } else if (!on && trail) {
        trail.destroy();
        trail = null;
      }
    });
  }
}
