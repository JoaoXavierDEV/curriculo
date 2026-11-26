import { Component, computed, input } from '@angular/core';
import { ICON_DEFS, IconDef, IconKey } from './icons';

/** Desenha um ícone do registro (vetor ou imagem). Sempre decorativo. */
@Component({
  selector: 'app-svg-icon',
  host: { 'aria-hidden': 'true' },
  template: `
    @let icon = def();
    @if (icon.image) {
      <img [src]="icon.image" alt="" width="180" height="180" loading="lazy" decoding="async" />
    } @else {
      <svg viewBox="0 0 24 24" [style.color]="icon.ink">
        @for (shape of icon.shapes; track $index) {
          <path
            [attr.d]="shape.d"
            [attr.fill]="shape.fill ?? 'currentColor'"
            [attr.stroke]="shape.stroke ?? null"
            [attr.stroke-width]="shape.strokeWidth ?? null"
            [attr.opacity]="shape.opacity ?? null"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        }
      </svg>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    svg,
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
    img {
      object-fit: cover;
      border-radius: inherit;
    }
  `,
})
export class SvgIcon {
  readonly name = input.required<IconKey>();
  protected readonly def = computed<IconDef>(() => ICON_DEFS[this.name()]);
}
