import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * "Digita" o texto do elemento (uma linha) quando ele entra na tela, como um
 * comando sendo escrito no terminal. Só CSS: a diretiva marca o comprimento
 * (`--len`) e o momento (`data-typed`). Sem JS, o texto aparece normal.
 */
@Directive({
  selector: '[appTypeOnView]',
})
export class TypeOnViewDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observer: IntersectionObserver | null = null;
    inject(DestroyRef).onDestroy(() => observer?.disconnect());

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const length = (element.textContent ?? '').trim().length + 2;
      element.style.setProperty('--len', String(length));
      element.dataset['typed'] = 'waiting';

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            element.dataset['typed'] = 'go';
            observer?.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(element);
    });
  }
}
