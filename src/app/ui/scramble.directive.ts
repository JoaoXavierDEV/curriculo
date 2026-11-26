import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { TERMINAL_ALPHABETS, loadAsciiKit } from './ascii-kit';

/**
 * Títulos que "decodificam" de caracteres de terminal até o texto real,
 * uma vez, quando entram na tela. O texto continua no DOM o tempo todo;
 * com movimento reduzido o kit já entrega o estado final.
 */
@Directive({
  selector: '[appScramble]',
})
export class ScrambleDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    let destroy: (() => void) | null = null;
    let destroyed = false;

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      destroy?.();
    });

    afterNextRender(() => {
      loadAsciiKit()
        .then(({ decode }) => {
          if (destroyed) return;
          const handle = decode(this.host.nativeElement, {
            scramble: TERMINAL_ALPHABETS,
            settle: 'text',
            trigger: 'visible',
            duration: 700,
            replayOnHover: false,
          });
          destroy = () => handle.destroy();
        })
        .catch(() => {
          // Sem o kit o título já está correto em HTML.
        });
    });
  }
}
