import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { DesktopIcon } from '../data/apps';
import { ICON_DEFS } from './icons';
import { SvgIcon } from './svg-icon';

/**
 * Um ícone do desktop/home: desenho + nome embaixo.
 * App → botão que abre a janela/tela. Atalho → link em nova aba, com a
 * setinha de atalho no canto, como no Windows.
 */
@Component({
  selector: 'app-os-icon',
  imports: [NgTemplateOutlet, SvgIcon],
  template: `
    @let item = icon();
    @if (item.kind === 'app') {
      <button type="button" class="icon" (click)="opened.emit($event)">
        <ng-container *ngTemplateOutlet="body" />
      </button>
    } @else {
      <a
        class="icon"
        [href]="item.href"
        [attr.target]="item.external ? '_blank' : null"
        [attr.rel]="item.external ? 'noopener noreferrer' : null"
      >
        <ng-container *ngTemplateOutlet="body" />
        @if (item.external) {
          <span class="sr-only">(abre em nova aba)</span>
        }
      </a>
    }

    <ng-template #body>
      <span
        class="art"
        [class.tile]="item.kind === 'link'"
        [style.background]="item.kind === 'link' ? tile() : null"
      >
        <app-svg-icon [name]="item.icon" />
        @if (item.kind === 'link') {
          <span class="shortcut" aria-hidden="true">↗</span>
        }
      </span>
      <span class="label">{{ item.label }}</span>
    </ng-template>
  `,
  styleUrl: './os-icon.css',
})
export class OsIcon {
  readonly icon = input.required<DesktopIcon>();
  readonly opened = output<MouseEvent>();

  protected readonly tile = computed(() => ICON_DEFS[this.icon().icon].tile);
}
