import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { NAME_BANNER, PORTRAIT } from '../data/ascii-art';
import { PROFILE } from '../data/profile.data';
import { loadAsciiKit } from '../ui/ascii-kit';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  host: {
    id: 'topo',
  },
})
export class Hero {
  protected readonly profile = PROFILE;
  protected readonly banner = NAME_BANNER;
  protected readonly portrait = PORTRAIT;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly copy = viewChild.required<ElementRef<HTMLElement>>('copy');

  constructor() {
    let destroy: (() => void) | null = null;
    let destroyed = false;

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      destroy?.();
    });

    // O fundo é decorativo: carrega depois do conteúdo e, sem WebGL2,
    // o kit devolve um handle inerte e o hero continua igual.
    afterNextRender(() => {
      loadAsciiKit()
        .then(({ background, drift }) => {
          if (destroyed) return;
          const handle = background(this.host.nativeElement, {
            preset: drift,
            clear: this.copy().nativeElement,
            ink: '--ascii-ink',
            cellSize: 12,
            speed: 0.7,
            charset: ' .:+*#',
            lazy: false,
          });
          destroy = () => handle.destroy();
        })
        .catch(() => {
          // Sem fundo animado: o gradiente do CSS continua lá.
        });
    });
  }
}
