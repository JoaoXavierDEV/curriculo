import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
} from '@angular/core';
import { AppId, appById } from '../data/apps';
import { IconKey } from './icons';
import { StartMenu } from './start-menu';
import { SvgIcon } from './svg-icon';
import { WindowManager } from '../services/window-manager.service';

/**
 * Taskbar do desktop: botão "JX" (menu Iniciar com programas e
 * configurações), um botão por janela aberta (focar / minimizar / restaurar)
 * e o relógio à direita.
 */
@Component({
  selector: 'app-taskbar',
  imports: [StartMenu, SvgIcon],
  host: { role: 'region', 'aria-label': 'Barra de tarefas' },
  template: `
    <button
      type="button"
      class="start"
      [class.on]="menuOpen()"
      aria-controls="menu-iniciar"
      [attr.aria-expanded]="menuOpen()"
      (click)="menuOpen.set(!menuOpen())"
    >
      <span aria-hidden="true">▌JX▐</span> iniciar
    </button>
    @if (menuOpen()) {
      <app-start-menu (launch)="launch($event)" (closed)="closeMenu()" />
    }

    <ul class="tasks" aria-label="Janelas abertas">
      @for (win of wm.running(); track win.id) {
        <li>
          <button
            type="button"
            class="task"
            [class.active]="wm.focused() === win.id"
            [class.min]="win.minimized"
            [attr.aria-pressed]="wm.focused() === win.id"
            (click)="wm.taskbarClick(win.id)"
          >
            <span class="task-icon"><app-svg-icon [name]="iconOf(win.id)" /></span>
            {{ fileName(win.id) }}
          </button>
        </li>
      }
    </ul>

    <span class="tray" aria-hidden="true">
      <span class="tray-item">utf-8</span>
      <span class="tray-item">{{ date() }}</span>
      <span class="clock">{{ clock() }}</span>
    </span>
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      align-items: stretch;
      height: var(--taskbar-h);
      border-top: 1px solid var(--color-line);
      background: #060807;
      font-size: 0.75rem;
    }
    .start {
      flex: none;
      padding: 0 0.9rem;
      border: 0;
      background: var(--color-phosphor);
      color: var(--color-ground);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition: transform 160ms var(--ease-out);
    }
    .start.on {
      background: color-mix(in oklab, var(--color-phosphor) 80%, white);
    }
    .start:active {
      transform: scale(0.96);
    }
    .start:focus-visible {
      outline-color: var(--color-fg);
      outline-offset: -4px;
    }
    .tasks {
      display: flex;
      flex: 1;
      gap: 1px;
      min-width: 0;
      margin: 0;
      padding: 0 0 0 1px;
      list-style: none;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .task {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 100%;
      max-width: 14rem;
      padding: 0 0.9rem;
      border: 0;
      border-bottom: 2px solid transparent;
      background: var(--color-surface);
      color: var(--color-muted);
      font: inherit;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background-color 140ms ease,
        color 140ms ease;
    }
    .task.active {
      border-bottom-color: var(--color-phosphor);
      background: var(--color-surface-2);
      color: var(--color-fg);
    }
    .task.min {
      color: var(--color-faint);
    }
    .task:focus-visible {
      outline-offset: -3px;
    }
    .task-icon {
      display: block;
      width: 1.1rem;
      height: 1.1rem;
      flex: none;
    }
    @media (hover: hover) and (pointer: fine) {
      .task:hover {
        background: var(--color-surface-2);
        color: var(--color-fg);
      }
    }
    .tray {
      display: flex;
      flex: none;
    }
    .tray > span {
      display: flex;
      align-items: center;
      padding: 0 0.8rem;
      border-left: 1px solid var(--color-line);
      color: var(--color-muted);
    }
    .tray .clock {
      background: var(--color-surface-2);
      color: var(--color-fg);
    }
  `,
})
export class Taskbar {
  protected readonly wm = inject(WindowManager);
  /** Pede ao desktop para abrir um programa (ele sabe o tamanho da área). */
  readonly opened = output<AppId>();
  protected readonly menuOpen = signal(false);
  protected readonly clock = signal('--:--');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly date = signal('');

  constructor() {
    let timer: ReturnType<typeof setInterval> | null = null;
    const onPointer = (event: PointerEvent) => {
      if (this.menuOpen() && !this.element.contains(event.target as Node)) this.closeMenu(false);
    };
    inject(DestroyRef).onDestroy(() => {
      if (timer) clearInterval(timer);
      removeEventListener('pointerdown', onPointer);
    });

    afterNextRender(() => {
      const tick = () => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        this.clock.set(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
        this.date.set(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`);
      };
      tick();
      timer = setInterval(tick, 15_000);
      addEventListener('pointerdown', onPointer);
    });
  }

  protected iconOf(id: AppId): IconKey {
    return appById(id).icon;
  }

  protected fileName(id: AppId): string {
    return appById(id).file;
  }

  protected launch(id: AppId): void {
    this.closeMenu(false);
    this.opened.emit(id);
  }

  protected closeMenu(returnFocus = true): void {
    this.menuOpen.set(false);
    if (returnFocus) this.element.querySelector<HTMLElement>('.start')?.focus();
  }
}
