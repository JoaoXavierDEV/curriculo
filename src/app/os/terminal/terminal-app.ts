import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { repoSlug } from '../../data/projects';
import { GithubReposService } from '../../services/github-repos.service';
import { SettingsService } from '../../services/settings.service';
import { OsNavigator } from '../os-navigator.service';
import { OutLine, TermAction, TermContext, complete, run } from './commands';

interface Entry {
  readonly id: number;
  /** Comando digitado (null para mensagens do sistema). */
  readonly command: string | null;
  readonly lines: readonly OutLine[];
}

const WELCOME: readonly OutLine[] = [
  { text: 'jxsh 1.1 — joaoxavier.dev', kind: 'accent' },
  {
    text: 'digite help para ver os comandos. experimente: neofetch, projeto salome, sudo hire joao',
    kind: 'dim',
  },
];

/**
 * Terminal: um prompt de verdade dentro do site. A lógica dos comandos fica em
 * `commands.ts` (pura); aqui ficam o histórico, o foco e as ações no "sistema".
 */
@Component({
  selector: 'app-terminal',
  host: { '(click)': 'focusInput()' },
  template: `
    <section class="term" aria-labelledby="terminal-title">
      <h2 id="terminal-title" class="sr-only">Terminal</h2>
      <div class="log" #log role="log" aria-live="polite" aria-label="Saída do terminal">
        @for (entry of entries(); track entry.id) {
          @if (entry.command !== null) {
            <p class="cmd">
              <span class="ps1" aria-hidden="true">{{ ps1 }}</span> {{ entry.command }}
            </p>
          }
          @for (line of entry.lines; track $index) {
            @if (line.href) {
              <p class="out {{ line.kind ?? '' }}">
                <a class="link" [href]="line.href" target="_blank" rel="noopener noreferrer">{{
                  line.text
                }}</a>
              </p>
            } @else {
              <p class="out {{ line.kind ?? '' }}">{{ line.text || ' ' }}</p>
            }
          }
        }
      </div>
      <form class="prompt-line" (submit)="submit($event)">
        <label for="term-input" class="ps1"
          ><span aria-hidden="true">{{ ps1 }}</span
          ><span class="sr-only">Digite um comando</span></label
        >
        <input
          #input
          id="term-input"
          name="command"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="send"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
          (keydown)="onKey($event)"
        />
      </form>
    </section>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #050706;
      cursor: text;
    }
    .term {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 1rem 1.25rem 1.25rem;
      font-size: 0.86rem;
      line-height: 1.55;
    }
    .log p {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .ps1 {
      color: var(--color-phosphor);
      white-space: nowrap;
    }
    .cmd {
      margin-top: 0.4rem !important;
      color: var(--color-fg);
    }
    .out {
      color: var(--color-muted);
    }
    .out.ok {
      color: var(--color-phosphor);
    }
    .out.err {
      color: #ff8a8a;
    }
    .out.dim {
      color: var(--color-faint);
    }
    .out.accent {
      color: var(--color-fg);
      font-weight: 500;
    }
    .prompt-line {
      display: flex;
      align-items: center;
      gap: 1ch;
      margin-top: 0.4rem;
    }
    input {
      flex: 1;
      min-width: 0;
      padding: 0.2rem 0;
      border: 0;
      background: transparent;
      color: var(--color-fg);
      font: inherit;
      caret-color: var(--color-phosphor);
      outline: none;
    }
    .prompt-line:focus-within {
      box-shadow: 0 1px 0 var(--color-phosphor-dim);
    }
  `,
})
export class TerminalApp {
  protected readonly ps1 = 'joao@xavier:~$';
  protected readonly entries = signal<readonly Entry[]>([{ id: 0, command: null, lines: WELCOME }]);
  protected readonly draft = signal('');

  private readonly nav = inject(OsNavigator);
  private readonly settings = inject(SettingsService);
  private readonly repos = inject(GithubReposService);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly log = viewChild.required<ElementRef<HTMLElement>>('log');

  private readonly history = signal<readonly string[]>([]);
  private historyIndex = -1;
  private nextId = 1;

  private readonly context = computed<Omit<TermContext, 'now'>>(() => ({
    history: this.history(),
    projects: this.repos
      .list()
      .repos.map((repo) => ({ name: repo.name, slug: repoSlug(repo.name) })),
  }));

  constructor() {
    // Rola até o fim a cada saída nova.
    afterRenderEffect(() => {
      this.entries();
      const scroller =
        this.log().nativeElement.closest('.body, .screen-body') ?? this.log().nativeElement;
      scroller.scrollTop = scroller.scrollHeight;
    });
  }

  protected focusInput(): void {
    if (!getSelection()?.toString()) this.input().nativeElement.focus({ preventScroll: true });
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const command = this.draft();
    this.draft.set('');
    this.historyIndex = -1;
    if (command.trim()) this.history.update((list) => [...list, command.trim()]);

    const outcome = run(command, { ...this.context(), now: new Date() });
    if (outcome.actions.some((action) => action.type === 'clear')) {
      this.entries.set([]);
    } else {
      this.entries.update((list) => [
        ...list,
        { id: this.nextId++, command, lines: outcome.lines },
      ]);
    }
    outcome.actions.forEach((action) => this.perform(action));
  }

  protected onKey(event: KeyboardEvent): void {
    const history = this.history();
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      this.historyIndex =
        this.historyIndex < 0 ? history.length - 1 : Math.max(0, this.historyIndex - 1);
      this.draft.set(history[this.historyIndex]);
    } else if (event.key === 'ArrowDown' && this.historyIndex >= 0) {
      event.preventDefault();
      this.historyIndex++;
      if (this.historyIndex >= history.length) {
        this.historyIndex = -1;
        this.draft.set('');
      } else {
        this.draft.set(history[this.historyIndex]);
      }
    } else if (event.key === 'Tab') {
      const completed = complete(this.draft(), { ...this.context(), now: new Date() });
      if (completed) {
        event.preventDefault();
        this.draft.set(completed);
      }
    } else if (event.key.toLowerCase() === 'l' && event.ctrlKey) {
      event.preventDefault();
      this.entries.set([]);
    }
  }

  private perform(action: TermAction): void {
    switch (action.type) {
      case 'open':
        this.nav.open(action.app, action.slug ? { slug: action.slug } : {});
        break;
      case 'link':
        window.open(action.href, '_blank', 'noopener,noreferrer');
        break;
      case 'wallpaper':
        this.settings.set('wallpaper', action.value);
        break;
      case 'crt':
        this.settings.set('crt', action.value);
        break;
      case 'exit':
        if (this.nav.mode() === 'phone') this.nav.back();
        else this.nav.close('terminal');
        break;
      case 'clear':
        break;
    }
  }
}
