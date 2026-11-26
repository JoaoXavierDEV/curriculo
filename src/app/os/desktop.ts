import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { APPS, DesktopIcon, ICONS } from '../data/apps';
import { WindowManager } from '../services/window-manager.service';
import { loadAsciiKit } from '../ui/ascii-kit';
import { AppWindow } from './app-window';
import { OsIcon } from './os-icon';
import { Taskbar } from './taskbar';

@Component({
  selector: 'app-desktop',
  imports: [OsIcon, AppWindow, Taskbar],
  template: `
    <main class="desktop" #desktop id="conteudo">
      <h1 class="sr-only">João Xavier, Dev Full Stack .NET + Angular</h1>
      <nav class="icons" aria-label="Área de trabalho">
        <ul>
          @for (icon of icons; track icon.id) {
            <li [attr.data-app-icon]="icon.id">
              <app-os-icon [icon]="icon" (opened)="open(icon, $event)" />
            </li>
          }
        </ul>
      </nav>

      <p class="wordmark" aria-hidden="true">joaoxavier.dev</p>

      @for (app of apps; track app.id) {
        <app-window [app]="app" />
      }
    </main>
    <app-taskbar />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-rows: 1fr var(--taskbar-h);
      height: 100dvh;
      overflow: hidden;
    }
    .desktop {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      outline: none;
      background:
        radial-gradient(70% 60% at 70% 40%, rgb(92 240 143 / 0.05), transparent 70%),
        var(--color-ground);
    }
    /* Scanlines bem sutis e estáticas, só no papel de parede. */
    .desktop::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0 3px,
        rgb(0 0 0 / 0.12) 3px 4px
      );
    }
    .icons {
      position: absolute;
      inset: 0.75rem auto 0.75rem 0.75rem;
      z-index: 1;
    }
    .icons ul {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(auto-fill, 6.4rem);
      grid-auto-columns: 6.5rem;
      gap: 0.4rem 0.5rem;
      height: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .wordmark {
      position: absolute;
      right: 1.5rem;
      bottom: 1rem;
      z-index: 0;
      margin: 0;
      font-family: var(--font-display);
      font-size: 1.6rem;
      color: var(--color-line-strong);
      user-select: none;
    }
  `,
})
export class Desktop {
  protected readonly icons = ICONS;
  protected readonly apps = APPS;

  private readonly wm = inject(WindowManager);
  private readonly desktop = viewChild.required<ElementRef<HTMLElement>>('desktop');

  constructor() {
    let destroy: (() => void) | null = null;
    let destroyed = false;
    const onHash = () => {
      const linked = this.wm.appFromHash();
      if (linked) this.wm.open(linked, undefined, this.viewport());
    };
    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      destroy?.();
      removeEventListener('hashchange', onHash);
    });

    afterNextRender(() => {
      const element = this.desktop().nativeElement;
      addEventListener('hashchange', onHash);
      // Abre o link direto (#projetos) ou, numa visita normal, o sobre.txt.
      this.openInitial();

      loadAsciiKit()
        .then(({ background, drift }) => {
          if (destroyed) return;
          const handle = background(element, {
            preset: drift,
            ink: '--ascii-ink',
            cellSize: 12,
            speed: 0.6,
            charset: ' .:+*#',
            lazy: false,
          });
          destroy = () => handle.destroy();
        })
        .catch(() => {
          // Papel de parede estático.
        });
    });
  }

  protected open(icon: DesktopIcon, event: MouseEvent): void {
    if (icon.kind !== 'app') return;
    const desktop = this.desktop().nativeElement.getBoundingClientRect();
    const tile = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.wm.open(
      icon.id,
      { x: tile.left + tile.width / 2 - desktop.left, y: tile.top + tile.height / 2 - desktop.top },
      { w: desktop.width, h: desktop.height },
    );
  }

  private viewport(): { w: number; h: number } {
    const rect = this.desktop().nativeElement.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  private openInitial(): void {
    const viewport = this.viewport();
    const linked = this.wm.appFromHash();
    if (linked) {
      this.wm.open(linked, undefined, viewport);
      return;
    }
    this.wm.open('sobre', undefined, viewport);
  }
}
