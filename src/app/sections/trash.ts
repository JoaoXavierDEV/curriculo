import { Component, computed, inject, signal } from '@angular/core';
import { WindowManager } from '../services/window-manager.service';

/**
 * Lixeira com um único item: o gato do "oiia". O GIF original tem fundo
 * verde de chroma key; o filtro SVG `#chroma-key`, aplicado por CSS, zera o
 * alfa onde o verde domina e tira o verde que vaza nas bordas do pelo.
 * O GIF (1,5 MB) só é pedido quando a lixeira está aberta.
 */
@Component({
  selector: 'app-trash',
  template: `
    <svg class="defs" aria-hidden="true" focusable="false" width="0" height="0">
      <filter id="chroma-key" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">
        <!--
          R' = R
          G' = (R + B) / 2      → tira o reflexo verde do pelo cinza
          B' = B
          A' = 1.6R − 2.2G + 1.6B + 1 → verde puro dá < 0 (transparente);
                                        cinza, branco e preto dão ≥ 1
          A região do filtro fica presa à imagem (x/y/width/height): fora
          dela o pixel é transparente e o "+1" o deixaria preto.
        -->
        <feColorMatrix
          type="matrix"
          values="1   0    0   0 0
                  0.5 0    0.5 0 0
                  0   0    1   0 0
                  1.6 -2.2 1.6 0 1"
        />
        <feComponentTransfer>
          <feFuncA type="linear" slope="1.6" intercept="-0.3" />
        </feComponentTransfer>
      </filter>
    </svg>

    <section class="section trash" id="lixeira" aria-labelledby="lixeira-title">
      <p class="section-kicker"><span class="prompt">ls -la ~/.lixeira</span></p>
      <h2 id="lixeira-title" class="trash-title">1 item na lixeira</h2>

      <figure class="cat">
        @if (opened()) {
          <img
            src="/cat.gif"
            width="320"
            height="320"
            alt="Gato malhado girando a cabeça (o meme oiia)"
            [class.raw]="!keyed()"
          />
        }
        <figcaption>
          <span class="text-phosphor" aria-hidden="true">●</span> cat.gif · 1,5 MB · fundo verde
          removido por CSS
        </figcaption>
      </figure>

      <label class="toggle">
        <input type="checkbox" [checked]="keyed()" (change)="keyed.set(!keyed())" />
        <span>remover fundo verde (chroma key)</span>
      </label>
    </section>
  `,
  styles: `
    .defs {
      position: absolute;
      width: 0;
      height: 0;
    }
    .trash-title {
      margin: 0.25rem 0 1rem;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 2rem;
      line-height: 1;
    }
    .cat {
      margin: 0;
      padding: 1rem;
      border: 1px dashed var(--color-line-strong);
      background: var(--color-surface);
    }
    .cat img {
      display: block;
      width: min(100%, 320px);
      height: auto;
      margin-inline: auto;
      filter: url('#chroma-key');
    }
    .cat img.raw {
      filter: none;
    }
    figcaption {
      margin-top: 0.75rem;
      font-size: 0.72rem;
      color: var(--color-muted);
    }
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 2.75rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .toggle input {
      width: 1rem;
      height: 1rem;
      accent-color: var(--color-phosphor);
    }
  `,
})
export class Trash {
  private readonly wm = inject(WindowManager);

  protected readonly keyed = signal(true);
  protected readonly opened = computed(
    () => this.wm.state('lixeira').open || this.wm.phoneApp() === 'lixeira',
  );
}
