import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Entrada suave quando o elemento chega perto da tela, uma vez só.
 * `appReveal` recebe a posição no grupo para o stagger (via `--i`).
 * O estado inicial só é aplicado no navegador, então sem JS nada fica escondido.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[style.--i]': 'index()',
  },
})
export class RevealDirective {
  readonly index = input(0, {
    alias: 'appReveal',
    transform: (value: number | string) => Number(value) || 0,
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    let observer: IntersectionObserver | null = null;
    inject(DestroyRef).onDestroy(() => observer?.disconnect());

    afterNextRender(() => {
      const element = this.host.nativeElement;
      if (typeof IntersectionObserver === 'undefined') return;

      const rect = element.getBoundingClientRect();
      // Já visível no primeiro frame: não esconde (evita piscar o hero).
      if (rect.top < innerHeight * 0.92) return;

      element.dataset['reveal'] = 'hidden';
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            element.dataset['reveal'] = 'shown';
            observer?.disconnect();
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(element);
    });
  }
}
