import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { loadAsciiKit } from '../ui/ascii-kit';

@Component({
  selector: 'app-site-footer',
  host: { role: 'contentinfo' },
  template: `
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <p class="wordmark" #mark>joaoxavier.dev</p>
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-5 text-xs text-muted"
      >
        <p class="m-0 prompt">exit 0 · © {{ year }} João Xavier</p>
        <p class="m-0">
          feito com Angular,
          <a class="link" href="https://asciify.org/" target="_blank" rel="noopener noreferrer"
            >asciify-engine<span class="sr-only"> (abre em nova aba)</span></a
          >
          e café
        </p>
        <a class="link" href="#topo">voltar ao topo <span aria-hidden="true">↑</span></a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 3rem 0 2.5rem;
      border-top: 1px solid var(--color-line);
      background: var(--color-surface);
    }
    .wordmark {
      position: relative;
      margin: 0 0 2rem;
      font-family: var(--font-display);
      font-size: clamp(3.2rem, 1rem + 11vw, 10rem);
      line-height: 1;
      aspect-ratio: 1800 / 300;
      display: grid;
      place-items: center;
      color: var(--color-phosphor-dim);
      text-align: center;
      overflow-wrap: anywhere;
      user-select: all;
    }
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();

  private readonly mark = viewChild.required<ElementRef<HTMLElement>>('mark');

  constructor() {
    let destroy: (() => void) | null = null;
    let destroyed = false;

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      destroy?.();
    });

    afterNextRender(() => {
      loadAsciiKit()
        .then(({ wordmark }) => {
          if (destroyed) return;
          const handle = wordmark(this.mark().nativeElement, {
            font: '"VT323", "JetBrains Mono", monospace',
            fontWeight: 400,
            ink: '--color-phosphor',
            artHeight: 300,
            assemble: 'visible',
            look: { cellSize: 5 },
          });
          destroy = () => handle.destroy();
        })
        .catch(() => {
          // O texto do HTML já é o wordmark.
        });
    });
  }
}
