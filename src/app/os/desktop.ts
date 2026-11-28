import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { APPS, AppId, DESKTOP_APPS, DesktopIcon, SHORTCUTS, TRASH } from '../data/apps';
import { SettingsService } from '../services/settings.service';
import { OsNavigator } from './os-navigator.service';
import { AsciiKit, OFFSCREEN_CLEAR, loadAsciiKit } from '../ui/ascii-kit';
import { AppWindow } from './app-window';
import { OsIcon } from './os-icon';
import { Taskbar } from './taskbar';

@Component({
  selector: 'app-desktop',
  imports: [OsIcon, AppWindow, Taskbar],
  template: `
    <main class="desktop" #desktop id="conteudo">
      <h1 class="sr-only">{{ navigator.heading() }}</h1>

      <nav class="icons apps" aria-label="Área de trabalho">
        <ul>
          @for (icon of desktopApps; track icon.id) {
            <li [attr.data-app-icon]="icon.id">
              <app-os-icon [icon]="icon" (opened)="openFromIcon(icon, $event)" />
            </li>
          }
        </ul>
        <div class="trash" [attr.data-app-icon]="trash.id">
          <app-os-icon [icon]="trash" (opened)="openFromIcon(trash, $event)" />
        </div>
      </nav>

      <nav class="icons links" aria-label="Atalhos (abrem em nova aba)">
        <ul>
          @for (icon of shortcuts; track icon.id) {
            <li [attr.data-app-icon]="icon.id">
              <app-os-icon [icon]="icon" />
            </li>
          }
        </ul>
      </nav>

      <p class="wordmark" aria-hidden="true">joaoxavier.dev</p>

      @for (app of windows; track app.id) {
        <app-window [app]="app" />
      }
    </main>
    <app-taskbar (opened)="openFromMenu($event)" />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-rows: 1fr var(--taskbar-h);
      height: 100dvh;
      overflow: hidden;
    }
    .desktop {
      --art: 3rem;
      position: relative;
      isolation: isolate;
      overflow: hidden;
      outline: none;
      background: var(--color-ground);
    }
    :host-context([data-icon-size='s']) .desktop {
      --art: 2.4rem;
    }
    :host-context([data-icon-size='l']) .desktop {
      --art: 3.8rem;
    }
    .icons {
      position: absolute;
      top: 0.75rem;
      bottom: 0.75rem;
      z-index: 1;
    }
    .icons ul {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(auto-fill, calc(var(--art) + 3.1rem));
      grid-auto-columns: calc(var(--art) + 3.5rem);
      gap: 0.25rem 0.35rem;
      height: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    /* Páginas à esquerda, de cima para baixo; a lixeira fica no canto de baixo. */
    .apps {
      left: 0.75rem;
      display: flex;
      flex-direction: column;
    }
    .apps ul {
      flex: 1;
      min-height: 0;
      height: auto;
    }
    /* Atalhos à direita: as colunas crescem da direita para a esquerda. */
    .links {
      right: 0.75rem;
    }
    .links ul {
      direction: rtl;
    }
    .links li {
      direction: ltr;
    }
    .trash {
      width: calc(var(--art) + 3.5rem);
      margin-bottom: 1.75rem;
    }
    .wordmark {
      position: absolute;
      left: 50%;
      bottom: 0.6rem;
      z-index: 0;
      margin: 0;
      translate: -50% 0;
      font-family: var(--font-display);
      font-size: 1.3rem;
      color: var(--color-line-strong);
      user-select: none;
    }
  `,
})
export class Desktop {
  protected readonly shortcuts = SHORTCUTS;
  protected readonly desktopApps = DESKTOP_APPS;
  protected readonly trash = TRASH;
  /** A janela de configurações é só do celular; no desktop elas ficam no Iniciar. */
  protected readonly windows = APPS.filter((app) => app.id !== 'config');

  protected readonly navigator = inject(OsNavigator);
  private readonly settings = inject(SettingsService);
  private readonly desktop = viewChild.required<ElementRef<HTMLElement>>('desktop');

  constructor() {
    const kit = signal<AsciiKit | null>(null);
    let wallpaper: ReturnType<AsciiKit['background']> | null = null;

    inject(DestroyRef).onDestroy(() => wallpaper?.destroy());

    afterNextRender(() => {
      loadAsciiKit()
        .then((loaded) => kit.set(loaded))
        .catch(() => {
          // Papel de parede estático.
        });
    });

    // Papel de parede "matrix" conforme a configuração.
    effect(() => {
      const mode = this.settings.settings().wallpaper;
      const asciiKit = kit();
      if (!asciiKit) return;
      if (mode === 'off') {
        wallpaper?.destroy();
        wallpaper = null;
        return;
      }
      const preset = mode === 'rain' ? asciiKit.cascade : asciiKit.caustics;
      if (wallpaper) {
        wallpaper.setPreset(preset);
        return;
      }
      wallpaper = asciiKit.background(this.desktop().nativeElement, {
        preset,
        ink: '--ascii-ink',
        cellSize: 12,
        speed: 0.6,
        lazy: false,
        // Sem "meio quieto": sem área livre, o preset apaga o centro e vira uma mancha
        // escura. Uma área de 1 px fora da tela faz o campo cobrir tudo.
        clear: OFFSCREEN_CLEAR,
      });
    });
  }

  protected openFromIcon(icon: DesktopIcon, event: MouseEvent): void {
    if (icon.kind !== 'app') return;
    const desktop = this.desktop().nativeElement.getBoundingClientRect();
    const tile = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.navigator.open(icon.id, {
      origin: {
        x: tile.left + tile.width / 2 - desktop.left,
        y: tile.top + tile.height / 2 - desktop.top,
      },
      viewport: this.viewport(),
    });
  }

  protected openFromMenu(id: AppId): void {
    const viewport = this.viewport();
    this.navigator.open(id, { origin: { x: 40, y: viewport.h }, viewport });
  }

  private viewport(): { w: number; h: number } {
    const rect = this.desktop().nativeElement.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }
}
