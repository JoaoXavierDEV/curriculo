import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  untracked,
} from '@angular/core';
import { AppIcon } from '../data/apps';
import { WindowManager } from '../services/window-manager.service';
import { AppContent } from './app-content';
import { OsNavigator } from './os-navigator.service';

/**
 * Janela do desktop. Fica sempre no DOM (o conteúdo continua indexável) e
 * alterna entre aberta, minimizada e fechada só por CSS + `inert`.
 * Arrasta pela barra de título; Esc fecha; foco entra ao abrir.
 */
@Component({
  selector: 'app-window',
  imports: [AppContent],
  host: {
    role: 'dialog',
    '[attr.aria-labelledby]': 'titleId()',
    '[attr.data-state]': 'visualState()',
    '[attr.inert]': "visualState() === 'open' ? null : ''",
    '[class.focused]': 'isFocused()',
    '[class.maximized]': 'state().maximized',
    '[style.z-index]': 'state().z',
    '[style.translate]': "state().maximized ? '0 0' : state().x + 'px ' + state().y + 'px'",
    '[style.width.px]': 'state().maximized ? null : app().size.w',
    '[style.height.px]': 'state().maximized ? null : app().size.h',
    '[style.transform-origin]': 'state().origin',
    tabindex: '-1',
    '(pointerdown)': 'nav.focus(app().id)',
    '(keydown.escape)': 'close()',
  },
  template: `
    <header
      class="titlebar"
      (pointerdown)="startDrag($event)"
      (dblclick)="wm.toggleMaximize(app().id)"
    >
      <span class="title" [id]="titleId()">
        <span aria-hidden="true">[ </span>{{ fileName() }}<span aria-hidden="true"> ]</span>
      </span>
      <span class="rule" aria-hidden="true"></span>
      <span class="controls">
        <button type="button" (click)="nav.minimize(app().id)">
          <span aria-hidden="true">[_]</span
          ><span class="sr-only">Minimizar {{ app().label }}</span>
        </button>
        <button type="button" (click)="wm.toggleMaximize(app().id)">
          <span aria-hidden="true">{{ state().maximized ? '[▫]' : '[□]' }}</span>
          <span class="sr-only"
            >{{ state().maximized ? 'Restaurar' : 'Maximizar' }} {{ app().label }}</span
          >
        </button>
        <button type="button" class="close" (click)="close()">
          <span aria-hidden="true">[x]</span><span class="sr-only">Fechar {{ app().label }}</span>
        </button>
      </span>
    </header>
    <div class="body">
      <app-content [app]="app().id" />
    </div>
  `,
  styleUrl: './app-window.css',
})
export class AppWindow {
  readonly app = input.required<AppIcon>();

  protected readonly wm = inject(WindowManager);
  protected readonly nav = inject(OsNavigator);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly state = computed(() => this.wm.state(this.app().id));
  protected readonly isFocused = computed(() => this.wm.focused() === this.app().id);
  protected readonly fileName = computed(() => {
    const app = this.app();
    const slug = this.wm.projectSlug();
    return app.id === 'projeto' && slug ? `projetos/${slug}.md` : app.file;
  });
  protected readonly titleId = computed(() => `win-${this.app().id}-title`);
  protected readonly visualState = computed(() => {
    const state = this.state();
    if (!state.open) return 'closed';
    return state.minimized ? 'minimized' : 'open';
  });

  constructor() {
    // Ao abrir ou voltar a ter foco, leva o foco do teclado para a janela.
    // Depois do render: antes disso a janela ainda está `inert`.
    afterRenderEffect(() => {
      const focused = this.isFocused();
      const visible = this.visualState() === 'open';
      if (focused && visible) {
        untracked(() => {
          if (!this.element.contains(document.activeElement)) {
            this.element.focus({ preventScroll: true });
          }
        });
      }
    });
  }

  protected close(): void {
    this.nav.close(this.app().id);
    document.querySelector<HTMLElement>(`[data-app-icon="${this.app().id}"] .icon`)?.focus();
  }

  protected startDrag(event: PointerEvent): void {
    if (event.button !== 0 || this.state().maximized) return;
    if ((event.target as HTMLElement).closest('button')) return;

    const handle = event.currentTarget as HTMLElement;
    const desktop = this.element.offsetParent as HTMLElement | null;
    const bounds = desktop?.getBoundingClientRect();
    const start = {
      x: event.clientX,
      y: event.clientY,
      winX: this.state().x,
      winY: this.state().y,
    };
    const id = this.app().id;

    handle.setPointerCapture(event.pointerId);
    this.element.classList.add('dragging');

    const onMove = (move: PointerEvent) => {
      let x = start.winX + move.clientX - start.x;
      let y = start.winY + move.clientY - start.y;
      if (bounds) {
        // A barra de título nunca sai da área de trabalho.
        x = Math.max(-this.element.offsetWidth + 120, Math.min(x, bounds.width - 120));
        y = Math.max(0, Math.min(y, bounds.height - 40));
      }
      this.wm.move(id, x, y);
    };
    const onUp = () => {
      this.element.classList.remove('dragging');
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }
}
