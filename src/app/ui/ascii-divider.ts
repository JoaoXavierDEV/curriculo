import { Component, input } from '@angular/core';

/**
 * Divisor entre seções desenhado com caracteres: uma régua de box-drawing,
 * um rótulo `[02/06] projetos` e um "cabeçote" que varre a régua quando a
 * seção aparece. Decorativo.
 */
@Component({
  selector: 'app-ascii-divider',
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="divider">
      <span class="ramp">░▒▓</span>
      <span class="rule"></span>
      <span class="label">[{{ index() }}/{{ total() }}] {{ label() }}</span>
      <span class="rule"></span>
      <span class="ramp">▓▒░</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 72rem;
      margin-inline: auto;
      padding-inline: 1.25rem;
      overflow: hidden;
    }
    @media (min-width: 768px) {
      :host {
        padding-inline: 2rem;
      }
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--color-line-strong);
      font-size: 0.78rem;
      white-space: nowrap;
    }
    .ramp {
      color: var(--color-phosphor-dim);
      letter-spacing: -0.05em;
    }
    .rule {
      position: relative;
      flex: 1;
      height: 1.2em;
      overflow: hidden;
    }
    /* A régua é texto de verdade (─), repetido além da largura e cortado. */
    .rule::before {
      content: '────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────';
      position: absolute;
      inset: 0;
      line-height: 1.2em;
    }
    /* Elemento com a largura da régua e o █ na ponta direita: transladar
       de -100% a 0 leva o cabeçote de uma ponta à outra só com transform. */
    .rule::after {
      content: '█';
      position: absolute;
      inset: 0;
      text-align: right;
      line-height: 1.2em;
      transform: translateX(-100%);
      color: var(--color-phosphor);
      text-shadow: 0 0 8px var(--color-phosphor);
      opacity: 0;
    }
    :host-context([data-crt='on']) .rule::after {
      animation: head 4.5s var(--ease-in-out) infinite;
    }
    .rule + .label + .rule::after {
      animation-delay: 2.25s;
    }
    .label {
      color: var(--color-muted);
    }
    @keyframes head {
      0% {
        transform: translateX(-100%);
        opacity: 0;
      }
      8% {
        opacity: 1;
      }
      45% {
        opacity: 1;
      }
      50%,
      100% {
        transform: translateX(0);
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host-context([data-crt='on']) .rule::after {
        animation: none;
      }
    }
  `,
})
export class AsciiDivider {
  readonly index = input.required<string>();
  readonly total = input('06');
  readonly label = input.required<string>();
}
