import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { DesktopIcon } from '../data/apps';

/**
 * Um ícone: um quadro com um glifo ASCII e o nome embaixo.
 * App → botão que abre a janela/tela. Atalho → link que abre em nova aba.
 */
@Component({
  selector: 'app-os-icon',
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
      <span class="tile" aria-hidden="true">
        <span class="glyph">{{ item.glyph }}</span>
        @if (item.kind === 'link') {
          <span class="badge">↗</span>
        }
      </span>
      <span class="label">{{ item.label }}</span>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
  styleUrl: './os-icon.css',
})
export class OsIcon {
  readonly icon = input.required<DesktopIcon>();
  readonly opened = output<MouseEvent>();
}
