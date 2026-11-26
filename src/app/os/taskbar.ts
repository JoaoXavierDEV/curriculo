import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { APPS, AppId, appById } from '../data/apps';
import { WindowManager } from '../services/window-manager.service';

/**
 * Taskbar do desktop (a antiga barra de status): botão "JX" que abre o
 * sobre.txt, um botão por janela aberta (focar / minimizar / restaurar) e o
 * relógio à direita.
 */
@Component({
  selector: 'app-taskbar',
  host: { role: 'region', 'aria-label': 'Barra de tarefas' },
  template: `
    <button type="button" class="start" (click)="openAbout($event)">
      <span aria-hidden="true">▌JX▐</span><span class="sr-only">Abrir sobre mim</span>
    </button>
    <span class="mode" aria-hidden="true">{{ wm.focused() ? 'INSERT' : 'NORMAL' }}</span>

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
            <span class="task-glyph" aria-hidden="true">{{ glyph(win.id) }}</span>
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
    .start:active {
      transform: scale(0.96);
    }
    .start:focus-visible {
      outline-color: var(--color-fg);
      outline-offset: -4px;
    }
    .mode {
      display: flex;
      align-items: center;
      padding: 0 0.8rem;
      background: var(--color-surface-2);
      color: var(--color-muted);
      letter-spacing: 0.04em;
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
    .task-glyph {
      color: var(--color-phosphor);
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
  protected readonly clock = signal('--:--');
  protected readonly date = signal('');

  constructor() {
    let timer: ReturnType<typeof setInterval> | null = null;
    inject(DestroyRef).onDestroy(() => {
      if (timer) clearInterval(timer);
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
    });
  }

  protected glyph(id: AppId): string {
    return appById(id).glyph;
  }

  protected fileName(id: AppId): string {
    return appById(id).file;
  }

  protected openAbout(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.wm.open('sobre', { x: rect.left + rect.width / 2, y: rect.top });
  }

  protected readonly apps = APPS;
}
