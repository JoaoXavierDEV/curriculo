import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { TERMINAL_ALPHABETS, loadAsciiKit } from './ascii-kit';

/**
 * Link que embaralha em caracteres de terminal quando o ponteiro entra e
 * volta ao texto real. Em repouso é HTML puro; o texto nunca sai do DOM.
 */
@Directive({
  selector: '[appScrambleHover]',
})
export class ScrambleHoverDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let destroy: (() => void) | null = null;
    let destroyed = false;

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      destroy?.();
    });

    afterNextRender(() => {
      if (
        typeof matchMedia !== 'function' ||
        !matchMedia('(hover: hover) and (pointer: fine)').matches
      ) {
        return;
      }
      loadAsciiKit()
        .then(({ decode }) => {
          if (destroyed) return;
          const handle = decode(element, {
            scramble: TERMINAL_ALPHABETS,
            trigger: 'manual',
            settle: 'text',
            duration: 420,
            replayOnHover: true,
          });
          destroy = () => handle.destroy();
        })
        .catch(() => {
          // Link normal.
        });
    });
  }
}
