import { Component, ElementRef, afterRenderEffect, inject, output } from '@angular/core';
import { APPS, AppId } from '../data/apps';
import { PROFILE } from '../data/profile.data';
import { SettingsPanel } from './settings-panel';
import { SvgIcon } from './svg-icon';

/**
 * Menu Iniciar: atalhos para os programas e as configurações visuais
 * (efeito matrix, CRT, ícones). Esc ou clique fora fecha; o foco entra no
 * primeiro item ao abrir.
 */
@Component({
  selector: 'app-start-menu',
  imports: [SettingsPanel, SvgIcon],
  host: {
    id: 'menu-iniciar',
    role: 'dialog',
    'aria-label': 'Menu Iniciar',
    '(keydown.escape)': 'closed.emit()',
  },
  template: `
    <div class="head">
      <span class="logo" aria-hidden="true">▌JX▐</span>
      <span>
        <strong class="name">{{ profile.name }}</strong>
        <span class="role">{{ profile.role }}</span>
      </span>
    </div>

    <div class="cols">
      <nav aria-label="Programas" class="programs">
        <p class="col-title">programas</p>
        <ul>
          @for (app of programs; track app.id) {
            <li>
              <button type="button" class="program" (click)="launch.emit(app.id)">
                <span class="program-icon"><app-svg-icon [name]="app.icon" /></span>
                {{ app.file }}
              </button>
            </li>
          }
        </ul>
      </nav>

      <section class="settings" aria-labelledby="iniciar-config">
        <p class="col-title" id="iniciar-config">configurações</p>
        <app-settings-panel />
      </section>
    </div>
  `,
  styles: `
    :host {
      position: absolute;
      left: 0;
      bottom: var(--taskbar-h);
      z-index: 2000;
      display: block;
      width: min(40rem, calc(100vw - 1rem));
      max-height: calc(100dvh - var(--taskbar-h) - 1rem);
      overflow: auto;
      border: 1px solid var(--color-phosphor-dim);
      background: #070908;
      box-shadow: 8px 8px 0 rgb(0 0 0 / 0.55);
      transform-origin: 0 100%;
      animation: rise 180ms var(--ease-out);
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }
    }
    .head {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--color-line);
      background: var(--color-surface);
    }
    .logo {
      padding: 0.3rem 0.5rem;
      background: var(--color-phosphor);
      color: var(--color-ground);
      font-weight: 700;
    }
    .name {
      display: block;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 1.6rem;
      line-height: 1;
      color: var(--color-phosphor);
    }
    .role {
      font-size: 0.75rem;
      color: var(--color-muted);
    }
    .cols {
      display: grid;
      grid-template-columns: 13rem 1fr;
    }
    .col-title {
      margin: 0 0 0.6rem;
      font-size: 0.7rem;
      color: var(--color-faint);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .programs {
      padding: 0.9rem 0.5rem 0.9rem 0.75rem;
      border-right: 1px solid var(--color-line);
    }
    .programs ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .program {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      min-height: 2.5rem;
      padding: 0 0.5rem;
      border: 0;
      background: transparent;
      color: var(--color-fg);
      font: inherit;
      font-size: 0.8rem;
      text-align: left;
      cursor: pointer;
      transition: background-color 120ms ease;
    }
    .program:focus-visible {
      outline-offset: -2px;
    }
    @media (hover: hover) and (pointer: fine) {
      .program:hover {
        background: var(--color-surface-2);
      }
    }
    .program-icon {
      display: block;
      width: 1.5rem;
      height: 1.5rem;
      flex: none;
    }
    .settings {
      padding: 0.9rem 1rem 1rem;
    }
    @media (max-width: 640px) {
      .cols {
        grid-template-columns: 1fr;
      }
      .programs {
        border-right: 0;
        border-bottom: 1px solid var(--color-line);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `,
})
export class StartMenu {
  readonly launch = output<AppId>();
  readonly closed = output<void>();

  protected readonly profile = PROFILE;
  protected readonly programs = APPS.filter((app) => app.id !== 'config');

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterRenderEffect(() => {
      if (!element.contains(document.activeElement)) {
        element.querySelector<HTMLElement>('.program')?.focus();
      }
    });
  }
}
